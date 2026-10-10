const mongoose = require('mongoose');
const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Attendance business logic, date normalization, and database interactions
 */
class AttendanceService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id, label = 'attendance') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid ${label} ID format`);
    }
  }

  /**
   * Normalizes any date input into a UTC midnight Date object (YYYY-MM-DDT00:00:00.000Z)
   * to prevent calendar date drift due to local timezone offsets.
   */
  normalizeCalendarDate(input) {
    if (!input) {
      throw new ApiError(400, 'Attendance date is required');
    }

    let dateStr;
    if (typeof input === 'string') {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        dateStr = `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        const parsed = new Date(input);
        if (isNaN(parsed.getTime())) {
          throw new ApiError(400, `Invalid date format: "${input}". Expected YYYY-MM-DD.`);
        }
        dateStr = parsed.toISOString().slice(0, 10);
      }
    } else if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new ApiError(400, 'Invalid Date object provided');
      }
      dateStr = input.toISOString().slice(0, 10);
    } else {
      throw new ApiError(400, 'Invalid date input type');
    }

    const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
    return { dateObj, dateStr };
  }

  /**
   * Mark attendance for a single student
   */
  async markAttendance(data) {
    const { student: studentId, date, status = 'present', remarks = '', allowCorrection = false } = data;

    if (!studentId) {
      throw new ApiError(400, 'Student ID is required');
    }
    this.validateId(studentId, 'student');

    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, `Student with ID "${studentId}" not found`);
    }

    const validStatuses = ['present', 'absent', 'late', 'excused'];
    const normalizedStatus = String(status).trim().toLowerCase();
    if (!validStatuses.includes(normalizedStatus)) {
      throw new ApiError(
        400,
        `Invalid attendance status "${status}". Allowed values: ${validStatuses.join(', ')}`
      );
    }

    const { dateObj, dateStr } = this.normalizeCalendarDate(date);

    // Check for existing record
    const existing = await Attendance.findOne({
      student: student._id,
      date: dateObj,
    });

    if (existing) {
      if (!allowCorrection) {
        throw new ApiError(
          409,
          `Attendance for ${student.firstName} ${student.lastName} (${student.admissionNumber}) has already been recorded as "${existing.status}" on ${dateStr}. Set allowCorrection to true to update.`
        );
      }

      existing.status = normalizedStatus;
      existing.remarks = remarks !== undefined ? String(remarks).trim() : existing.remarks;
      existing.className = student.className;
      existing.section = student.section || '';
      await existing.save();

      return await Attendance.findById(existing._id).populate(
        'student',
        'firstName lastName admissionNumber rollNumber className section'
      );
    }

    const record = new Attendance({
      student: student._id,
      date: dateObj,
      dateString: dateStr,
      status: normalizedStatus,
      className: student.className,
      section: student.section || '',
      remarks: String(remarks).trim(),
    });

    const saved = await record.save();
    return await Attendance.findById(saved._id).populate(
      'student',
      'firstName lastName admissionNumber rollNumber className section'
    );
  }

  /**
   * Bulk mark attendance for a class roster
   * Safely handles existing records, explicit corrections, and conflict detection
   */
  async bulkMarkAttendance(payload) {
    const { date, records, allowCorrection = false } = payload;

    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new ApiError(400, 'Attendance records array is required');
    }

    const { dateObj, dateStr } = this.normalizeCalendarDate(date);
    const validStatuses = ['present', 'absent', 'late', 'excused'];

    // Collect and validate student IDs
    const studentIds = [];
    for (const r of records) {
      const sId = r.student || r.studentId;
      if (!sId) {
        throw new ApiError(400, 'Each attendance record must include a student ID');
      }
      this.validateId(sId, 'student');
      studentIds.push(sId);
    }

    // Verify all students exist in database
    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    for (const sId of studentIds) {
      if (!studentMap.has(sId.toString())) {
        throw new ApiError(404, `Student with ID "${sId}" does not exist`);
      }
    }

    // Check for existing records on this date
    const existingRecords = await Attendance.find({
      student: { $in: studentIds },
      date: dateObj,
    }).populate('student', 'firstName lastName admissionNumber rollNumber');

    const existingMap = new Map(existingRecords.map((r) => [r.student._id.toString(), r]));

    // If existing records exist and allowCorrection is false, report conflicts explicitly
    if (existingRecords.length > 0 && !allowCorrection) {
      const conflicts = existingRecords.map((r) => ({
        studentId: r.student._id,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        admissionNumber: r.student.admissionNumber,
        existingStatus: r.status,
        existingRecordId: r._id,
      }));

      throw new ApiError(
        409,
        `Attendance has already been recorded for ${conflicts.length} student(s) on ${dateStr}. Set allowCorrection to true to modify existing records.`,
        conflicts
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const processedIds = [];

    for (const item of records) {
      const sId = (item.student || item.studentId).toString();
      const student = studentMap.get(sId);
      const normalizedStatus = String(item.status || 'present').trim().toLowerCase();

      if (!validStatuses.includes(normalizedStatus)) {
        throw new ApiError(
          400,
          `Invalid status "${item.status}" for student ${student.admissionNumber}. Allowed: ${validStatuses.join(', ')}`
        );
      }

      const remarks = item.remarks !== undefined ? String(item.remarks).trim() : '';
      const existing = existingMap.get(sId);

      if (existing) {
        existing.status = normalizedStatus;
        existing.remarks = remarks;
        existing.className = student.className;
        existing.section = student.section || '';
        await existing.save();
        updatedCount++;
        processedIds.push(existing._id);
      } else {
        const newRecord = new Attendance({
          student: student._id,
          date: dateObj,
          dateString: dateStr,
          status: normalizedStatus,
          className: student.className,
          section: student.section || '',
          remarks,
        });
        const saved = await newRecord.save();
        createdCount++;
        processedIds.push(saved._id);
      }
    }

    const savedRecords = await Attendance.find({ _id: { $in: processedIds } })
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .sort({ 'student.rollNumber': 1, 'student.firstName': 1 });

    return {
      date: dateStr,
      total: records.length,
      created: createdCount,
      updated: updatedCount,
      records: savedRecords,
    };
  }

  /**
   * Query attendance records with date, class, section, status filters
   */
  async getAllAttendance(query = {}) {
    const { date, className, section, status, studentId, sortBy = 'createdAt', order = 'desc' } = query;
    const filter = {};

    if (date) {
      const { dateObj } = this.normalizeCalendarDate(date);
      const nextDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
      filter.date = { $gte: dateObj, $lt: nextDay };
    }

    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    if (section && section.trim()) {
      filter.section = section.trim().toUpperCase();
    }

    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    if (studentId && studentId.trim()) {
      this.validateId(studentId.trim(), 'student');
      filter.student = studentId.trim();
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const attendance = await Attendance.find(filter)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .sort(sortObj);

    const total = await Attendance.countDocuments(filter);

    return {
      attendance,
      total,
    };
  }

  /**
   * Retrieve a single attendance record by ID
   */
  async getAttendanceById(id) {
    this.validateId(id);

    const record = await Attendance.findById(id).populate(
      'student',
      'firstName lastName admissionNumber rollNumber className section'
    );

    if (!record) {
      throw new ApiError(404, `Attendance record with ID "${id}" not found`);
    }

    return record;
  }

  /**
   * Update an attendance record by ID
   */
  async updateAttendance(id, updateData) {
    this.validateId(id);

    const record = await Attendance.findById(id);
    if (!record) {
      throw new ApiError(404, `Attendance record with ID "${id}" not found`);
    }

    const validStatuses = ['present', 'absent', 'late', 'excused'];

    if (updateData.status) {
      const normalizedStatus = String(updateData.status).trim().toLowerCase();
      if (!validStatuses.includes(normalizedStatus)) {
        throw new ApiError(
          400,
          `Invalid attendance status "${updateData.status}". Allowed: ${validStatuses.join(', ')}`
        );
      }
      record.status = normalizedStatus;
    }

    if (updateData.remarks !== undefined) {
      record.remarks = String(updateData.remarks).trim();
    }

    // If date is being updated, verify uniqueness
    if (updateData.date) {
      const { dateObj, dateStr } = this.normalizeCalendarDate(updateData.date);
      const existing = await Attendance.findOne({
        student: record.student,
        date: dateObj,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(
          409,
          `Another attendance record already exists for this student on ${dateStr}`
        );
      }

      record.date = dateObj;
      record.dateString = dateStr;
    }

    await record.save();

    return await Attendance.findById(id).populate(
      'student',
      'firstName lastName admissionNumber rollNumber className section'
    );
  }

  /**
   * Return attendance summary counts and attendance rate for selected date, class, and section
   */
  async getAttendanceSummary(query = {}) {
    const { date, className, section } = query;
    const filter = {};

    let dateStr;
    if (date) {
      const normalized = this.normalizeCalendarDate(date);
      const nextDay = new Date(normalized.dateObj.getTime() + 24 * 60 * 60 * 1000);
      filter.date = { $gte: normalized.dateObj, $lt: nextDay };
      dateStr = normalized.dateStr;
    } else {
      // Default to today in UTC
      const today = new Date().toISOString().slice(0, 10);
      const normalized = this.normalizeCalendarDate(today);
      const nextDay = new Date(normalized.dateObj.getTime() + 24 * 60 * 60 * 1000);
      filter.date = { $gte: normalized.dateObj, $lt: nextDay };
      dateStr = today;
    }

    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    if (section && section.trim()) {
      filter.section = section.trim().toUpperCase();
    }

    const records = await Attendance.find(filter);
    const total = records.length;

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    for (const r of records) {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    }

    // Attendance rate = present / total (handles zero denominator safely)
    const attendanceRate = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    return {
      date: dateStr,
      className: className || 'all',
      section: section || 'all',
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate,
    };
  }
}

module.exports = new AttendanceService();
