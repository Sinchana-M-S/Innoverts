import express from 'express';
import Chat from '../models/Chat.js';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get or create chat for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    let chat = await Chat.findOne({ courseId: req.params.courseId });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        courseId: req.params.courseId,
        participants: [req.user._id],
        messages: [],
      });
      await chat.save();
    } else {
      // Add user to participants if not already
      if (!chat.participants.includes(req.user._id)) {
        chat.participants.push(req.user._id);
        await chat.save();
      }
    }

    await chat.populate('participants', 'name profilePicture');
    await chat.populate('messages.userId', 'name profilePicture');

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/course/:courseId/message', authenticate, async (req, res) => {
  try {
    const { message, fileUrl, fileName, timestamp } = req.body;

    let chat = await Chat.findOne({ courseId: req.params.courseId });

    if (!chat) {
      chat = new Chat({
        courseId: req.params.courseId,
        participants: [req.user._id],
        messages: [],
      });
    }

    chat.messages.push({
      userId: req.user._id,
      userName: req.user.name,
      message,
      fileUrl,
      fileName,
      timestamp,
    });

    await chat.save();

    await chat.populate('messages.userId', 'name profilePicture');

    res.json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

