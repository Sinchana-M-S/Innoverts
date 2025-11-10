import express from 'express';
import LiveClass from '../models/LiveClass.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all live classes
router.get('/', authenticate, async (req, res) => {
  try {
    const { upcoming, myClasses } = req.query;
    let query = {};

    if (myClasses === 'true') {
      query.$or = [
        { instructorId: req.user._id },
        { 'participants.userId': req.user._id },
      ];
    }

    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.isCompleted = false;
    }

    const classes = await LiveClass.find(query)
      .populate('instructorId', 'name profilePicture')
      .populate('participants.userId', 'name profilePicture')
      .sort({ scheduledAt: 1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single live class
router.get('/:id', authenticate, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('instructorId', 'name profilePicture')
      .populate('participants.userId', 'name profilePicture');

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Schedule live class (instructor only)
router.post('/', authenticate, authorize('instructor', 'both'), async (req, res) => {
  try {
    const { courseId, title, description, scheduledAt, duration } = req.body;

    // Generate meeting link (in production, integrate with Zoom/Google Meet API)
    const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetingLink = `https://meet.sarvasva.com/${meetingId}`;

    const liveClass = new LiveClass({
      instructorId: req.user._id,
      courseId: courseId || null,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      meetingLink,
      meetingId,
    });

    await liveClass.save();

    res.status(201).json(liveClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join live class
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    // Check if already joined
    const existingParticipant = liveClass.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (!existingParticipant) {
      liveClass.participants.push({
        userId: req.user._id,
        joinedAt: new Date(),
      });
      await liveClass.save();
    }

    res.json({ meetingLink: liveClass.meetingLink, liveClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start/End live class
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { isActive, isCompleted } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    if (liveClass.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isActive !== undefined) liveClass.isActive = isActive;
    if (isCompleted !== undefined) liveClass.isCompleted = isCompleted;

    await liveClass.save();

    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

