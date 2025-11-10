import express from 'express';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get assessments for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assessments = await Assessment.find({
      courseId: req.params.courseId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single assessment
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('submissions.userId', 'name profilePicture');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create assessment (instructor only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId, type, title, description, questions, dueDate } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const assessment = new Assessment({
      courseId,
      type,
      title,
      description,
      questions: questions || [],
      dueDate,
    });

    await assessment.save();

    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assessment
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { answers, fileUrl } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if already submitted
    const existingSubmission = assessment.submissions.find(
      (s) => s.userId.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    // Calculate score (simple AI grading for now)
    let score = 0;
    let totalPoints = 0;

    if (assessment.type === 'quiz') {
      answers.forEach((answer, index) => {
        const question = assessment.questions[index];
        if (question && question.correctAnswer === answer.answer) {
          score += question.points || 1;
        }
        totalPoints += question.points || 1;
      });
    }

    const submission = {
      userId: req.user._id,
      answers,
      fileUrl,
      score,
      feedback: `You scored ${score}/${totalPoints}`,
      gradedBy: 'ai',
    };

    assessment.submissions.push(submission);
    await assessment.save();

    // Award credits for completing assessment
    const user = await User.findById(req.user._id);
    const creditsEarned = 10;
    user.credits += creditsEarned;
    user.creditsHistory.push({
      type: 'earned',
      amount: creditsEarned,
      description: `Completed assessment: ${assessment.title}`,
      courseId: assessment.courseId,
    });
    await user.save();

    res.json({ submission, creditsEarned, message: 'Assessment submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

