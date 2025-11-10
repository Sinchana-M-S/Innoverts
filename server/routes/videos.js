import express from 'express';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get videos for a course
router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course.videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add video to course
router.post('/:courseId', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, videoUrl, duration, order } = req.body;

    course.videos.push({
      title,
      videoUrl,
      duration,
      order: order || course.videos.length,
      subtitles: new Map(),
      boardTextData: [],
    });

    await course.save();

    res.json(course.videos[course.videos.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update video subtitles
router.put('/:courseId/:videoIndex/subtitles', authenticate, async (req, res) => {
  try {
    const { language, text } = req.body;
    const course = await Course.findById(req.params.courseId);
    const videoIndex = parseInt(req.params.videoIndex);

    if (!course || !course.videos[videoIndex]) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (!course.videos[videoIndex].subtitles) {
      course.videos[videoIndex].subtitles = new Map();
    }

    course.videos[videoIndex].subtitles.set(language, text);
    await course.save();

    res.json(course.videos[videoIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update board text data
router.put('/:courseId/:videoIndex/board-text', authenticate, async (req, res) => {
  try {
    const { text, timestamp, language, translatedText } = req.body;
    const course = await Course.findById(req.params.courseId);
    const videoIndex = parseInt(req.params.videoIndex);

    if (!course || !course.videos[videoIndex]) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (!course.videos[videoIndex].boardTextData) {
      course.videos[videoIndex].boardTextData = [];
    }

    course.videos[videoIndex].boardTextData.push({
      text,
      timestamp,
      language,
      translatedText: new Map(Object.entries(translatedText || {})),
    });

    await course.save();

    res.json(course.videos[videoIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

