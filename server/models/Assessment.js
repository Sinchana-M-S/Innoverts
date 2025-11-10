import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['quiz', 'assignment'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['multiple-choice', 'true-false', 'fill-blank', 'essay'],
          required: true,
        },
        options: [String], // For multiple choice
        correctAnswer: mongoose.Schema.Types.Mixed,
        points: {
          type: Number,
          default: 1,
        },
        order: Number,
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
    dueDate: Date,
    submissions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answers: [
          {
            questionId: mongoose.Schema.Types.ObjectId,
            answer: mongoose.Schema.Types.Mixed,
            fileUrl: String, // For assignments
          },
        ],
        score: Number,
        feedback: String,
        gradedBy: {
          type: String,
          enum: ['ai', 'instructor'],
          default: 'ai',
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total points before saving
assessmentSchema.pre('save', function (next) {
  if (this.questions.length > 0) {
    this.totalPoints = this.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );
  }
  next();
});

export default mongoose.model('Assessment', assessmentSchema);

