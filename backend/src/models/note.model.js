const mongoose = require('mongoose');

/**
 * Note Schema
 *
 * SENSITIVITY & SECURITY NOTICE:
 * Student notes represent sensitive educational and behavioral records.
 * Currently, backend authentication/authorization is in a development-only state
 * using placeholder middleware. This module is NOT secured for production use
 * until authentic token verification and role-based access control are activated.
 */
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Note title cannot exceed 200 characters'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['academic_progress', 'classroom_participation', 'behavior', 'general_observation'],
        message: '{VALUE} is not a valid note category (academic_progress, classroom_participation, behavior, general_observation)',
      },
      lowercase: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Author/Teacher reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Note date is required'],
      default: Date.now,
      index: true,
    },
    dateString: {
      type: String, // 'YYYY-MM-DD' companion for calendar date filtering
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimal filtering and chronological ordering
noteSchema.index({ student: 1, createdAt: -1 });
noteSchema.index({ teacher: 1, createdAt: -1 });
noteSchema.index({ category: 1, createdAt: -1 });
noteSchema.index({ dateString: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
