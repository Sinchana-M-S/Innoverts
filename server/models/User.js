import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'both'],
      default: 'student',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    credits: {
      type: Number,
      default: 100, // Initial credits
    },
    creditsHistory: [
      {
        type: {
          type: String,
          enum: ['earned', 'spent', 'initial'],
        },
        amount: Number,
        description: String,
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    completedCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        creditsEarned: Number,
        certificateUrl: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bio: {
      type: String,
      default: '',
    },
    skills: [String],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

