import express from 'express';
import Document from '../models/Document.js';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|md/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, DOCX, TXT, and MD files are allowed'));
  },
});

const router = express.Router();

// Get user's documents
router.get('/', authenticate, async (req, res) => {
  try {
    const { courseId, type } = req.query;
    let query = { userId: req.user._id };

    if (courseId) {
      query.courseId = courseId;
    }
    if (type) {
      query.type = type;
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, type, courseId, tags } = req.body;

    const document = new Document({
      userId: req.user._id,
      courseId: courseId || null,
      title: title || req.file.originalname,
      type: type || 'other',
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? tags.split(',') : [],
    });

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Summarize document
router.post('/:id/summarize', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Simulate AI summarization (in production, integrate with OpenAI or similar)
    const summary = `This is a summary of ${document.title}. The document contains important information related to the course content. Key points include: 1) Main concepts, 2) Important definitions, 3) Practical examples, 4) Summary of key takeaways.`;

    document.summary = summary;
    document.isSummarized = true;
    await document.save();

    res.json({ summary, document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Summarize course/video
router.post('/summarize-content', authenticate, async (req, res) => {
  try {
    const { courseId, videoIndex } = req.body;

    // Simulate AI summarization
    const summary = `Course Summary: This course covers essential topics with practical examples. Key learning objectives include understanding core concepts, applying knowledge in real-world scenarios, and mastering advanced techniques. The course is structured to provide comprehensive learning experience.`;

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

