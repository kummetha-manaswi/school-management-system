const mongoose = require('mongoose');
const Student = require('../models/student.model');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Student business logic and database interactions
 */
class StudentService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid student ID format');
    }
  }

  /**
   * Create a new student record
   */
  async createStudent(studentData) {
    const admissionNumber = studentData.admissionNumber?.trim()?.toUpperCase();

    if (!admissionNumber) {
      throw new ApiError(400, 'Admission number is required');
    }

    // Check duplicate admission number
    const existing = await Student.findOne({ admissionNumber });
    if (existing) {
      throw new ApiError(409, `Student with admission number "${admissionNumber}" already exists`);
    }

    const student = new Student({
      ...studentData,
      admissionNumber,
    });

    return await student.save();
  }

  /**
   * Query students with search and filtering
   */
  async getAllStudents(query = {}) {
    const { search, className, section, status, sortBy = 'createdAt', order = 'desc' } = query;
    const filter = {};

    // Text search on firstName, lastName, admissionNumber, or rollNumber
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
        { rollNumber: searchRegex },
      ];
    }

    // Exact filters
    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    if (section && section.trim()) {
      filter.section = section.trim().toUpperCase();
    }

    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const students = await Student.find(filter).sort(sortObj);
    const total = await Student.countDocuments(filter);

    return {
      students,
      total,
    };
  }

  /**
   * Retrieve single student by ID
   */
  async getStudentById(id) {
    this.validateId(id);

    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(404, `Student with ID "${id}" not found`);
    }

    return student;
  }

  /**
   * Update student details
   */
  async updateStudent(id, updateData) {
    this.validateId(id);

    // If changing admissionNumber, verify uniqueness
    if (updateData.admissionNumber) {
      const formattedAdmission = updateData.admissionNumber.trim().toUpperCase();
      const existing = await Student.findOne({
        admissionNumber: formattedAdmission,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(409, `Another student already has admission number "${formattedAdmission}"`);
      }
      updateData.admissionNumber = formattedAdmission;
    }

    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      throw new ApiError(404, `Student with ID "${id}" not found`);
    }

    return student;
  }

  /**
   * Delete student by ID
   */
  async deleteStudent(id) {
    this.validateId(id);

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new ApiError(404, `Student with ID "${id}" not found`);
    }

    return student;
  }
}

module.exports = new StudentService();
