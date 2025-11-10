import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'price') {
      sortOption = { price: 1 };
    }

    const courses = await Course.find(query)
      .populate('instructorId', 'name profilePicture')
      .sort(sortOption)
      .limit(50);

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'name profilePicture bio')
      .populate('enrolledStudents', 'name profilePicture');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (instructor only)
router.post('/', authenticate, authorize('instructor', 'both'), async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      videos,
      price,
      category,
      tags,
      learningObjectives,
      prerequisites,
    } = req.body;

    const course = new Course({
      title,
      description,
      instructorId: req.user._id,
      instructorName: req.user.name,
      thumbnail,
      videos: videos || [],
      price,
      category,
      tags: tags || [],
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      isPublished: false,
    });

    await course.save();

    // Add to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id },
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course
router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    if (user.credits < course.price) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    // Deduct credits
    user.credits -= course.price;
    user.creditsHistory.push({
      type: 'spent',
      amount: course.price,
      description: `Enrolled in ${course.title}`,
      courseId: course._id,
    });

    // Enroll
    user.enrolledCourses.push(course._id);
    course.enrolledStudents.push(user._id);

    await user.save();
    await course.save();

    res.json({ message: 'Enrolled successfully', credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add rating/review
router.post('/:id/rating', authenticate, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'Must be enrolled to rate' });
    }

    // Remove existing rating if any
    course.ratings = course.ratings.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );

    // Add new rating
    course.ratings.push({
      userId: req.user._id,
      rating,
      review,
    });

    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

