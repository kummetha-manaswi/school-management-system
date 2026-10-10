const mongoose = require('mongoose');
const Assignment = require('../models/assignment.model');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Assignment business logic, validations, and database interactions
 */
class AssignmentService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id, label = 'assignment') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid ${label} ID format`);
    }
  }

  /**
   * Normalizes any date input into a UTC midnight Date object (YYYY-MM-DDT00:00:00.000Z)
   * to ensure consistent calendar-date comparisons.
   */
  normalizeCalendarDate(input, label = 'Date') {
    if (!input) {
      throw new ApiError(400, `${label} is required`);
    }

    let dateStr;
    if (typeof input === 'string') {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        dateStr = `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        const parsed = new Date(input);
        if (isNaN(parsed.getTime())) {
          throw new ApiError(400, `Invalid date format for ${label}: "${input}". Expected YYYY-MM-DD.`);
        }
        dateStr = parsed.toISOString().slice(0, 10);
      }
    } else if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new ApiError(400, `Invalid Date object provided for ${label}`);
      }
      dateStr = input.toISOString().slice(0, 10);
    } else {
      throw new ApiError(400, `Invalid date input type for ${label}`);
    }

    const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
    return { dateObj, dateStr };
  }

  /**
   * Validates attachment URLs
   */
  validateAttachments(attachments) {
    if (!attachments) return [];
    if (!Array.isArray(attachments)) {
      throw new ApiError(400, 'Attachments must be an array of objects');
    }

    const validated = [];
    for (const item of attachments) {
      if (!item || typeof item !== 'object') {
        throw new ApiError(400, 'Each attachment must be an object with url and optional title');
      }

      const url = String(item.url || '').trim();
      if (!url) {
        throw new ApiError(400, 'Attachment URL cannot be empty');
      }

      // Validate URL protocol and structure
      try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Protocol not supported');
        }
      } catch (err) {
        throw new ApiError(
          400,
          `Invalid attachment URL: "${url}". Must be a valid absolute HTTP or HTTPS URL.`
        );
      }

      validated.push({
        title: item.title ? String(item.title).trim() : '',
        url,
      });
    }

    return validated;
  }

  /**
   * Validates that teacher exists in the database if provided
   */
  async validateTeacher(teacherId) {
    if (!teacherId) return null;
    this.validateId(teacherId, 'teacher');

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, `Teacher with ID "${teacherId}" not found`);
    }

    return teacher._id;
  }

  /**
   * Create a new assignment
   */
  async createAssignment(data) {
    const {
      title,
      description = '',
      subject,
      className,
      section = '',
      teacher: teacherId,
      assignedDate,
      dueDate,
      status = 'published',
      attachments = [],
      maxMarks = 100,
    } = data;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Assignment title is required');
    }
    if (!subject || !subject.trim()) {
      throw new ApiError(400, 'Subject is required');
    }
    if (!className || !className.trim()) {
      throw new ApiError(400, 'Class name is required');
    }
    if (!dueDate) {
      throw new ApiError(400, 'Due date is required');
    }

    // Normalize dates
    const effectiveAssigned = assignedDate
      ? this.normalizeCalendarDate(assignedDate, 'Assigned date')
      : this.normalizeCalendarDate(new Date().toISOString().slice(0, 10), 'Assigned date');

    const effectiveDue = this.normalizeCalendarDate(dueDate, 'Due date');

    // Due date cannot be earlier than assigned date
    if (effectiveDue.dateObj < effectiveAssigned.dateObj) {
      throw new ApiError(
        400,
        `Due date (${effectiveDue.dateStr}) cannot be earlier than assigned date (${effectiveAssigned.dateStr})`
      );
    }

    // Validate teacher if provided
    const validTeacherId = await this.validateTeacher(teacherId);

    // Validate attachments
    const validatedAttachments = this.validateAttachments(attachments);

    // Format section (empty string means 'All Sections')
    const formattedSection = section ? String(section).trim().toUpperCase() : '';

    const assignment = new Assignment({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      className: className.trim(),
      section: formattedSection,
      teacher: validTeacherId,
      assignedDate: effectiveAssigned.dateObj,
      assignedDateString: effectiveAssigned.dateStr,
      dueDate: effectiveDue.dateObj,
      dueDateString: effectiveDue.dateStr,
      status: status.toLowerCase(),
      attachments: validatedAttachments,
      maxMarks: Number(maxMarks) >= 0 ? Number(maxMarks) : 100,
    });

    const saved = await assignment.save();
    return await Assignment.findById(saved._id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );
  }

  /**
   * Update an existing assignment
   * Validates combined final state (not just fields present in request)
   */
  async updateAssignment(id, updateData) {
    this.validateId(id, 'assignment');

    const existing = await Assignment.findById(id);
    if (!existing) {
      throw new ApiError(404, `Assignment with ID "${id}" not found`);
    }

    // Determine combined final dates
    let finalAssignedObj = existing.assignedDate;
    let finalAssignedStr = existing.assignedDateString;
    if (updateData.assignedDate !== undefined) {
      const norm = this.normalizeCalendarDate(updateData.assignedDate, 'Assigned date');
      finalAssignedObj = norm.dateObj;
      finalAssignedStr = norm.dateStr;
    }

    let finalDueObj = existing.dueDate;
    let finalDueStr = existing.dueDateString;
    if (updateData.dueDate !== undefined) {
      const norm = this.normalizeCalendarDate(updateData.dueDate, 'Due date');
      finalDueObj = norm.dateObj;
      finalDueStr = norm.dateStr;
    }

    // Reject due date earlier than assigned date
    if (finalDueObj < finalAssignedObj) {
      throw new ApiError(
        400,
        `Due date (${finalDueStr}) cannot be earlier than assigned date (${finalAssignedStr})`
      );
    }

    // Validate teacher if updated
    if (updateData.teacher !== undefined) {
      if (updateData.teacher === null || updateData.teacher === '') {
        existing.teacher = null;
      } else {
        existing.teacher = await this.validateTeacher(updateData.teacher);
      }
    }

    // Validate attachments if updated
    if (updateData.attachments !== undefined) {
      existing.attachments = this.validateAttachments(updateData.attachments);
    }

    // Apply basic updates if provided
    if (updateData.title !== undefined) {
      const t = String(updateData.title).trim();
      if (!t) throw new ApiError(400, 'Assignment title cannot be empty');
      existing.title = t;
    }

    if (updateData.description !== undefined) {
      existing.description = String(updateData.description).trim();
    }

    if (updateData.subject !== undefined) {
      const s = String(updateData.subject).trim();
      if (!s) throw new ApiError(400, 'Subject cannot be empty');
      existing.subject = s;
    }

    if (updateData.className !== undefined) {
      const c = String(updateData.className).trim();
      if (!c) throw new ApiError(400, 'Class name cannot be empty');
      existing.className = c;
    }

    if (updateData.section !== undefined) {
      existing.section = updateData.section ? String(updateData.section).trim().toUpperCase() : '';
    }

    if (updateData.status !== undefined) {
      const validStatuses = ['draft', 'published', 'completed', 'archived'];
      const st = String(updateData.status).trim().toLowerCase();
      if (!validStatuses.includes(st)) {
        throw new ApiError(400, `Invalid status "${st}". Allowed: ${validStatuses.join(', ')}`);
      }
      existing.status = st;
    }

    if (updateData.maxMarks !== undefined) {
      const m = Number(updateData.maxMarks);
      if (isNaN(m) || m < 0) throw new ApiError(400, 'Max marks must be a non-negative number');
      existing.maxMarks = m;
    }

    existing.assignedDate = finalAssignedObj;
    existing.assignedDateString = finalAssignedStr;
    existing.dueDate = finalDueObj;
    existing.dueDateString = finalDueStr;

    await existing.save();

    return await Assignment.findById(id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );
  }

  /**
   * List assignments with search and filters
   */
  async getAllAssignments(query = {}) {
    const {
      search,
      className,
      section,
      subject,
      teacher,
      status,
      dueDate,
      isOverdue,
      sortBy = 'dueDate',
      order = 'asc',
    } = query;

    const filter = {};

    // General text search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }, { subject: searchRegex }];
    }

    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    // Section filtering:
    // If specific section is requested, return assignments for that section OR assignments with empty section ('All Sections')
    if (section && section.trim()) {
      const sec = section.trim().toUpperCase();
      filter.section = { $in: [sec, ''] };
    }

    if (subject && subject.trim()) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    if (teacher && teacher.trim()) {
      this.validateId(teacher.trim(), 'teacher');
      filter.teacher = teacher.trim();
    }

    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    if (dueDate) {
      const { dateObj } = this.normalizeCalendarDate(dueDate, 'Due date');
      const nextDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
      filter.dueDate = { $gte: dateObj, $lt: nextDay };
    }

    // Dynamic overdue filtering
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayUtc = new Date(`${todayStr}T00:00:00.000Z`);

    if (isOverdue === 'true' || isOverdue === true) {
      filter.status = 'published';
      filter.dueDate = { $lt: todayUtc };
    } else if (isOverdue === 'false' || isOverdue === false) {
      filter.$or = [
        { status: { $ne: 'published' } },
        { dueDate: { $gte: todayUtc } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    const assignments = await Assignment.find(filter)
      .populate('teacher', 'firstName lastName employeeId subject specialization email phone')
      .sort(sortObj);

    const total = await Assignment.countDocuments(filter);

    return {
      assignments,
      total,
    };
  }

  /**
   * Retrieve single assignment by ID
   */
  async getAssignmentById(id) {
    this.validateId(id, 'assignment');

    const assignment = await Assignment.findById(id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );

    if (!assignment) {
      throw new ApiError(404, `Assignment with ID "${id}" not found`);
    }

    return assignment;
  }

  /**
   * Delete an assignment by ID
   */
  async deleteAssignment(id) {
    this.validateId(id, 'assignment');

    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      throw new ApiError(404, `Assignment with ID "${id}" not found`);
    }

    return assignment;
  }

  /**
   * Summary overview counts
   */
  async getAssignmentSummary(query = {}) {
    const { className, section, subject, teacher } = query;
    const filter = {};

    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    if (section && section.trim()) {
      filter.section = { $in: [section.trim().toUpperCase(), ''] };
    }

    if (subject && subject.trim()) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    if (teacher && teacher.trim()) {
      this.validateId(teacher.trim(), 'teacher');
      filter.teacher = teacher.trim();
    }

    const assignments = await Assignment.find(filter);
    const total = assignments.length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayUtc = new Date(`${todayStr}T00:00:00.000Z`);

    let published = 0;
    let overdue = 0;
    let completed = 0;
    let draft = 0;
    let archived = 0;

    for (const a of assignments) {
      if (a.status === 'published') {
        published++;
        if (a.dueDate < todayUtc) {
          overdue++;
        }
      } else if (a.status === 'completed') {
        completed++;
      } else if (a.status === 'draft') {
        draft++;
      } else if (a.status === 'archived') {
        archived++;
      }
    }

    return {
      total,
      published,
      overdue,
      completed,
      draft,
      archived,
    };
  }
}

module.exports = new AssignmentService();
