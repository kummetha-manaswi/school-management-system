const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      index: true,
    },
    examType: {
      type: String,
      enum: {
        values: ['unit_test', 'midterm', 'final', 'quiz', 'practical', 'other'],
        message: '{VALUE} is not a valid exam type (unit_test, midterm, final, quiz, practical, other)',
      },
      default: 'unit_test',
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      index: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: '', // Empty string indicates all sections of the class
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
      index: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
      index: true,
    },
    examDateString: {
      type: String, // 'YYYY-MM-DD'
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
      default: 60,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be greater than zero'],
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      min: [0, 'Passing marks cannot be negative'],
      default: 35,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid exam status (scheduled, ongoing, completed, cancelled)',
      },
      default: 'scheduled',
      lowercase: true,
      index: true,
    },
    isResultPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    resultsPublishedAt: {
      type: Date,
      default: null,
    },
    resultsPublishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
