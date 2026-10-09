const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender (male, female, other)',
      },
      default: 'male',
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    assignedClasses: {
      type: [String],
      default: [],
    },
    assignedSections: {
      type: [String],
      default: [],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    employmentStatus: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'resigned'],
        message: '{VALUE} is not a valid employment status (active, inactive, resigned)',
      },
      default: 'active',
      lowercase: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for teacher's full name
teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
