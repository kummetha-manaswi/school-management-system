const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    marksObtained: {
      type: Number,
      min: [0, 'Marks obtained cannot be negative'],
      default: 0,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pass', 'fail', 'absent'],
        message: '{VALUE} is not a valid result status (pass, fail, absent)',
      },
      default: 'pass',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    className: {
      type: String,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index ensuring only one result per student per exam
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = ExamResult;
