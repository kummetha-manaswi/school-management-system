const mongoose = require('mongoose');

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    relationshipType: {
      type: String,
      enum: {
        values: ['father', 'mother', 'guardian', 'other'],
        message: '{VALUE} is not a valid relationship type (father, mother, guardian, other)',
      },
      default: 'guardian',
      lowercase: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'revoked'],
        message: '{VALUE} is not a valid relationship status (pending, verified, revoked)',
      },
      default: 'pending',
      lowercase: true,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    revocationReason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
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

// Compound unique index ensuring only one relationship document per parent-student pair
parentStudentSchema.index({ parent: 1, student: 1 }, { unique: true });

// Compound indexes for rapid status queries
parentStudentSchema.index({ student: 1, status: 1 });
parentStudentSchema.index({ parent: 1, status: 1 });

const ParentStudent = mongoose.model('ParentStudent', parentStudentSchema);

module.exports = ParentStudent;
