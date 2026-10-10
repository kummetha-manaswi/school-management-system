const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
      default: '', // Empty string represents 'All Sections'
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      index: true,
      default: null,
    },
    assignedDate: {
      type: Date,
      required: [true, 'Assigned date is required'],
      index: true,
    },
    assignedDateString: {
      type: String, // 'YYYY-MM-DD'
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    dueDateString: {
      type: String, // 'YYYY-MM-DD'
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'completed', 'archived'],
        message: '{VALUE} is not a valid assignment status (draft, published, completed, archived)',
      },
      default: 'published',
      lowercase: true,
      index: true,
    },
    attachments: [
      {
        title: {
          type: String,
          trim: true,
          default: '',
        },
        url: {
          type: String,
          trim: true,
          required: [true, 'Attachment URL is required'],
        },
      },
    ],
    maxMarks: {
      type: Number,
      min: [0, 'Max marks cannot be negative'],
      default: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic overdue calculation:
// Only published assignments with dueDate earlier than current UTC calendar date are overdue.
// Draft, completed, and archived assignments are NOT overdue.
assignmentSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'published') {
    return false;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayUtc = new Date(`${todayStr}T00:00:00.000Z`);
  return this.dueDate < todayUtc;
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
