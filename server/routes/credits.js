import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get credits balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      credits: user.credits,
      history: user.creditsHistory.slice(-20).reverse(), // Last 20 transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get full credits history
router.get('/history', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'creditsHistory.courseId',
      'title thumbnail'
    );
    res.json(user.creditsHistory.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Award credits (for course completion, assessments, etc.)
router.post('/award', authenticate, async (req, res) => {
  try {
    const { amount, description, courseId } = req.body;
    const user = await User.findById(req.user._id);

    user.credits += amount;
    user.creditsHistory.push({
      type: 'earned',
      amount,
      description,
      courseId,
    });

    await user.save();

    res.json({ credits: user.credits, message: 'Credits awarded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete course and award credits
router.post('/complete-course', authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findById(req.user._id);
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    // Check if already completed
    const alreadyCompleted = user.completedCourses.find(
      (c) => c.courseId.toString() === courseId.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Course already completed' });
    }

    // Award credits (e.g., 50 credits per course)
    const creditsEarned = 50;
    user.credits += creditsEarned;
    user.creditsHistory.push({
      type: 'earned',
      amount: creditsEarned,
      description: `Completed course: ${course.title}`,
      courseId,
    });

    // Add to completed courses
    user.completedCourses.push({
      courseId,
      creditsEarned,
      certificateUrl: `/certificates/${user._id}-${courseId}.pdf`, // Generate certificate
    });

    await user.save();

    res.json({
      credits: user.credits,
      creditsEarned,
      message: 'Course completed!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

