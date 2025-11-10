import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: Number, // in minutes
    meetingLink: {
      type: String,
      default: '',
    },
    meetingId: String,
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    recordingUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('LiveClass', liveClassSchema);

