const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
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
    dateOfBirth: {
      type: Date,
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
      default: '',
    },
    rollNumber: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    parentName: {
      type: String,
      trim: true,
      default: '',
    },
    parentPhone: {
      type: String,
      trim: true,
      default: '',
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        message: '{VALUE} is not a valid blood group',
      },
      uppercase: true,
      default: '',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'graduated', 'transferred'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for student's full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
