const mongoose = require('mongoose');
const Note = require('../models/note.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

const VALID_CATEGORIES = [
  'academic_progress',
  'classroom_participation',
  'behavior',
  'general_observation',
];

/**
 * Service handling Teacher Notes business logic, validations, and persistence
 * 
 * SENSITIVITY & SECURITY NOTICE:
 * Teacher notes represent confidential student observations.
 * In this developmental stage, the author/teacher identity is received as a parameter
 * and validated for existence in the database. When the real Authentication module is activated,
 * the author ID MUST be extracted directly from verified JWT claims (req.user), not trusted
 * from client payload.
 */
class NoteService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id, label = 'note') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid ${label} ID format: "${id}"`);
    }
  }

  /**
   * Normalizes any date input into a UTC midnight Date object (YYYY-MM-DDT00:00:00.000Z)
   */
  normalizeCalendarDate(input, label = 'Note date') {
    if (!input) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
      return { dateObj, dateStr };
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
   * Validate that referenced student exists
   */
  async validateStudent(studentId) {
    this.validateId(studentId, 'student');
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, `Student with ID "${studentId}" not found`);
    }
    return student;
  }

  /**
   * Validate that referenced teacher exists
   * 
   * NOTE FOR FUTURE AUTHENTICATION:
   * During this development phase, we verify the teacher exists in the database.
   * Once authentication is active, author identity must be bound to req.user.
   */
  async validateTeacher(teacherId) {
    this.validateId(teacherId, 'teacher');
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, `Teacher with ID "${teacherId}" not found`);
    }
    return teacher;
  }

  /**
   * Create a new Teacher Note
   */
  async createNote(data) {
    const { title, content, category, student: studentId, teacher: teacherId, date } = data;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Note title is required');
    }
    if (title.trim().length > 200) {
      throw new ApiError(400, 'Note title cannot exceed 200 characters');
    }
    if (!content || !content.trim()) {
      throw new ApiError(400, 'Note content is required');
    }
    if (!category || !category.trim()) {
      throw new ApiError(400, 'Note category is required');
    }

    const formattedCategory = category.trim().toLowerCase();
    if (!VALID_CATEGORIES.includes(formattedCategory)) {
      throw new ApiError(
        400,
        `Invalid category "${category}". Allowed categories: ${VALID_CATEGORIES.join(', ')}`
      );
    }

    if (!studentId) {
      throw new ApiError(400, 'Student reference is required');
    }
    if (!teacherId) {
      throw new ApiError(400, 'Teacher/Author reference is required');
    }

    // Validate references
    const student = await this.validateStudent(studentId);
    const teacher = await this.validateTeacher(teacherId);

    // Normalize calendar date
    const { dateObj, dateStr } = this.normalizeCalendarDate(date, 'Note date');

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      category: formattedCategory,
      student: student._id,
      teacher: teacher._id,
      date: dateObj,
      dateString: dateStr,
    });

    const saved = await note.save();

    return await Note.findById(saved._id)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .populate('teacher', 'firstName lastName employeeId subject specialization email');
  }

  /**
   * Get all notes with filtering, pagination, and chronological sorting
   */
  async getAllNotes(query = {}) {
    const {
      search,
      category,
      student,
      teacher,
      date,
      className,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    if (category && category.trim()) {
      const formattedCategory = category.trim().toLowerCase();
      if (VALID_CATEGORIES.includes(formattedCategory)) {
        filter.category = formattedCategory;
      }
    }

    if (student && student.trim()) {
      this.validateId(student.trim(), 'student');
      filter.student = student.trim();
    }

    if (teacher && teacher.trim()) {
      this.validateId(teacher.trim(), 'teacher');
      filter.teacher = teacher.trim();
    }

    if (date) {
      const { dateStr } = this.normalizeCalendarDate(date, 'Filter date');
      filter.dateString = dateStr;
    }

    // If filtering by className, find student IDs in that class
    if (className && className.trim()) {
      const studentsInClass = await Student.find({
        className: { $regex: new RegExp(`^${className.trim()}$`, 'i') },
      }).select('_id');
      const studentIds = studentsInClass.map((s) => s._id);
      if (filter.student) {
        // If specific student was already requested, keep it only if in list
        if (!studentIds.some((id) => id.toString() === filter.student.toString())) {
          return { notes: [], total: 0, page: Number(page), totalPages: 0 };
        }
      } else {
        filter.student = { $in: studentIds };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['createdAt', 'date', 'title'].includes(sortBy) ? sortBy : 'createdAt';
    const sortObj = { [sortField]: sortOrder };

    const notes = await Note.find(filter)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .populate('teacher', 'firstName lastName employeeId subject specialization email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Note.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    return {
      notes,
      total,
      page: pageNum,
      totalPages,
    };
  }

  /**
   * Get single note by ID
   */
  async getNoteById(id) {
    this.validateId(id, 'note');

    const note = await Note.findById(id)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .populate('teacher', 'firstName lastName employeeId subject specialization email');

    if (!note) {
      throw new ApiError(404, `Note with ID "${id}" not found`);
    }

    return note;
  }

  /**
   * Update an existing note
   */
  async updateNote(id, updateData) {
    this.validateId(id, 'note');

    const note = await Note.findById(id);
    if (!note) {
      throw new ApiError(404, `Note with ID "${id}" not found`);
    }

    if (updateData.title !== undefined) {
      const t = String(updateData.title).trim();
      if (!t) throw new ApiError(400, 'Note title cannot be empty');
      if (t.length > 200) throw new ApiError(400, 'Note title cannot exceed 200 characters');
      note.title = t;
    }

    if (updateData.content !== undefined) {
      const c = String(updateData.content).trim();
      if (!c) throw new ApiError(400, 'Note content cannot be empty');
      note.content = c;
    }

    if (updateData.category !== undefined) {
      const cat = String(updateData.category).trim().toLowerCase();
      if (!VALID_CATEGORIES.includes(cat)) {
        throw new ApiError(
          400,
          `Invalid category "${updateData.category}". Allowed categories: ${VALID_CATEGORIES.join(', ')}`
        );
      }
      note.category = cat;
    }

    if (updateData.student !== undefined) {
      const student = await this.validateStudent(updateData.student);
      note.student = student._id;
    }

    if (updateData.teacher !== undefined) {
      const teacher = await this.validateTeacher(updateData.teacher);
      note.teacher = teacher._id;
    }

    if (updateData.date !== undefined) {
      const { dateObj, dateStr } = this.normalizeCalendarDate(updateData.date, 'Note date');
      note.date = dateObj;
      note.dateString = dateStr;
    }

    await note.save();

    return await Note.findById(id)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .populate('teacher', 'firstName lastName employeeId subject specialization email');
  }

  /**
   * Delete note by ID
   */
  async deleteNote(id) {
    this.validateId(id, 'note');

    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      throw new ApiError(404, `Note with ID "${id}" not found`);
    }

    return note;
  }

  /**
   * Get category summary counts
   */
  async getNoteSummary(query = {}) {
    const { student, teacher, className, date } = query;
    const filter = {};

    if (student && student.trim()) {
      this.validateId(student.trim(), 'student');
      filter.student = student.trim();
    }

    if (teacher && teacher.trim()) {
      this.validateId(teacher.trim(), 'teacher');
      filter.teacher = teacher.trim();
    }

    if (date) {
      const { dateStr } = this.normalizeCalendarDate(date, 'Filter date');
      filter.dateString = dateStr;
    }

    if (className && className.trim()) {
      const studentsInClass = await Student.find({
        className: { $regex: new RegExp(`^${className.trim()}$`, 'i') },
      }).select('_id');
      const studentIds = studentsInClass.map((s) => s._id);
      if (filter.student) {
        if (!studentIds.some((id) => id.toString() === filter.student.toString())) {
          return {
            total: 0,
            academic_progress: 0,
            classroom_participation: 0,
            behavior: 0,
            general_observation: 0,
          };
        }
      } else {
        filter.student = { $in: studentIds };
      }
    }

    const notes = await Note.find(filter);
    const total = notes.length;

    let academic_progress = 0;
    let classroom_participation = 0;
    let behavior = 0;
    let general_observation = 0;

    for (const n of notes) {
      if (n.category === 'academic_progress') academic_progress++;
      else if (n.category === 'classroom_participation') classroom_participation++;
      else if (n.category === 'behavior') behavior++;
      else if (n.category === 'general_observation') general_observation++;
    }

    return {
      total,
      academic_progress,
      classroom_participation,
      behavior,
      general_observation,
    };
  }
}

module.exports = new NoteService();
