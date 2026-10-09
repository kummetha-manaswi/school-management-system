const mongoose = require('mongoose');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Teacher business logic and database interactions
 */
class TeacherService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid teacher ID format');
    }
  }

  /**
   * Helper to normalize array fields (support array or comma-separated string)
   */
  normalizeArrayField(val) {
    if (Array.isArray(val)) {
      return val.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof val === 'string' && val.trim()) {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Sanitize and format teacher data
   */
  formatTeacherData(data) {
    const formatted = { ...data };

    if (formatted.employeeId) {
      formatted.employeeId = formatted.employeeId.trim().toUpperCase();
    }

    // Synchronize subject and specialization if only one is specified
    if (formatted.subject && !formatted.specialization) {
      formatted.specialization = formatted.subject.trim();
    } else if (formatted.specialization && !formatted.subject) {
      formatted.subject = formatted.specialization.trim();
    }

    // Support status alias for employmentStatus
    if (formatted.status && !formatted.employmentStatus) {
      formatted.employmentStatus = formatted.status.trim().toLowerCase();
    }

    if (formatted.assignedClasses !== undefined) {
      formatted.assignedClasses = this.normalizeArrayField(formatted.assignedClasses);
    }

    if (formatted.assignedSections !== undefined) {
      formatted.assignedSections = this.normalizeArrayField(formatted.assignedSections);
    }

    return formatted;
  }

  /**
   * Create a new teacher record
   */
  async createTeacher(teacherData) {
    const formatted = this.formatTeacherData(teacherData);
    const employeeId = formatted.employeeId;

    if (!employeeId) {
      throw new ApiError(400, 'Employee ID is required');
    }

    // Check duplicate employee ID
    const existing = await Teacher.findOne({ employeeId });
    if (existing) {
      throw new ApiError(409, `Teacher with employee ID "${employeeId}" already exists`);
    }

    const teacher = new Teacher(formatted);
    return await teacher.save();
  }

  /**
   * Query teachers with search and filtering
   */
  async getAllTeachers(query = {}) {
    const {
      search,
      employeeId,
      name,
      subject,
      specialization,
      employmentStatus,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = {};

    // General text search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { subject: searchRegex },
        { specialization: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Specific filters
    if (employeeId && employeeId.trim()) {
      filter.employeeId = new RegExp(employeeId.trim(), 'i');
    }

    if (name && name.trim()) {
      const nameRegex = new RegExp(name.trim(), 'i');
      filter.$or = [{ firstName: nameRegex }, { lastName: nameRegex }];
    }

    const targetSubject = (subject || specialization || '').trim();
    if (targetSubject) {
      const subjectRegex = new RegExp(targetSubject, 'i');
      filter.$or = [{ subject: subjectRegex }, { specialization: subjectRegex }];
    }

    const targetStatus = (employmentStatus || status || '').trim().toLowerCase();
    if (targetStatus) {
      filter.employmentStatus = targetStatus;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const teachers = await Teacher.find(filter).sort(sortObj);
    const total = await Teacher.countDocuments(filter);

    return {
      teachers,
      total,
    };
  }

  /**
   * Retrieve single teacher by ID
   */
  async getTeacherById(id) {
    this.validateId(id);

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new ApiError(404, `Teacher with ID "${id}" not found`);
    }

    return teacher;
  }

  /**
   * Update teacher details
   */
  async updateTeacher(id, updateData) {
    this.validateId(id);

    const formatted = this.formatTeacherData(updateData);

    // If changing employeeId, verify uniqueness
    if (formatted.employeeId) {
      const existing = await Teacher.findOne({
        employeeId: formatted.employeeId,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(409, `Another teacher already has employee ID "${formatted.employeeId}"`);
      }
    }

    const teacher = await Teacher.findByIdAndUpdate(id, formatted, {
      new: true,
      runValidators: true,
    });

    if (!teacher) {
      throw new ApiError(404, `Teacher with ID "${id}" not found`);
    }

    return teacher;
  }

  /**
   * Delete teacher by ID
   */
  async deleteTeacher(id) {
    this.validateId(id);

    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      throw new ApiError(404, `Teacher with ID "${id}" not found`);
    }

    return teacher;
  }
}

module.exports = new TeacherService();
