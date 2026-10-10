const mongoose = require('mongoose');
const Exam = require('../models/exam.model');
const ExamResult = require('../models/examResult.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const ApiError = require('../utils/ApiError');

/**
 * Service handling Exam and ExamResult business logic, validations, analytics, and data persistence
 */
class ExamService {
  /**
   * Helper to ensure valid MongoDB ObjectId
   */
  validateId(id, label = 'exam') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid ${label} ID format`);
    }
  }

  /**
   * Normalizes any date input into a UTC midnight Date object (YYYY-MM-DDT00:00:00.000Z)
   * to guarantee zero local timezone offset drift.
   */
  normalizeCalendarDate(input, label = 'Exam date') {
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
   * Validate teacher exists if ID provided
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
   * Create a new Exam
   */
  async createExam(data) {
    const {
      title,
      examType = 'unit_test',
      subject,
      className,
      section = '',
      teacher: teacherId,
      examDate,
      startTime = '',
      durationMinutes = 60,
      maxMarks = 100,
      passingMarks = 35,
      instructions = '',
      status = 'scheduled',
    } = data;

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Exam title is required');
    }
    if (!subject || !subject.trim()) {
      throw new ApiError(400, 'Subject is required');
    }
    if (!className || !className.trim()) {
      throw new ApiError(400, 'Class name is required');
    }

    const max = Number(maxMarks);
    const pass = Number(passingMarks);

    if (isNaN(max) || max <= 0) {
      throw new ApiError(400, 'Maximum marks must be greater than zero');
    }
    if (isNaN(pass) || pass < 0) {
      throw new ApiError(400, 'Passing marks cannot be negative');
    }
    if (pass > max) {
      throw new ApiError(400, `Passing marks (${pass}) cannot exceed maximum marks (${max})`);
    }

    const { dateObj, dateStr } = this.normalizeCalendarDate(examDate, 'Exam date');
    const validTeacherId = await this.validateTeacher(teacherId);
    const formattedSection = section ? String(section).trim().toUpperCase() : '';

    const exam = new Exam({
      title: title.trim(),
      examType: examType.toLowerCase(),
      subject: subject.trim(),
      className: className.trim(),
      section: formattedSection,
      teacher: validTeacherId,
      examDate: dateObj,
      examDateString: dateStr,
      startTime: String(startTime).trim(),
      durationMinutes: Number(durationMinutes) >= 1 ? Number(durationMinutes) : 60,
      maxMarks: max,
      passingMarks: pass,
      instructions: String(instructions).trim(),
      status: status.toLowerCase(),
    });

    const saved = await exam.save();
    return await Exam.findById(saved._id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );
  }

  /**
   * Update an existing exam
   * Validates combined state of existing values and incoming changes
   */
  async updateExam(id, updateData) {
    this.validateId(id, 'exam');

    const existing = await Exam.findById(id);
    if (!existing) {
      throw new ApiError(404, `Exam with ID "${id}" not found`);
    }

    const finalMax = updateData.maxMarks !== undefined ? Number(updateData.maxMarks) : existing.maxMarks;
    const finalPass = updateData.passingMarks !== undefined ? Number(updateData.passingMarks) : existing.passingMarks;

    if (isNaN(finalMax) || finalMax <= 0) {
      throw new ApiError(400, 'Maximum marks must be greater than zero');
    }
    if (isNaN(finalPass) || finalPass < 0) {
      throw new ApiError(400, 'Passing marks cannot be negative');
    }
    if (finalPass > finalMax) {
      throw new ApiError(400, `Passing marks (${finalPass}) cannot exceed maximum marks (${finalMax})`);
    }

    if ((updateData.maxMarks !== undefined || updateData.passingMarks !== undefined) && existing.isResultPublished) {
      throw new ApiError(
        400,
        'Cannot modify maximum or passing marks for a published exam. An administrator must unpublish results before making changes.'
      );
    }

    // Critical Requirement: If reducing maxMarks, verify no existing result exceeds new maxMarks
    if (finalMax < existing.maxMarks) {
      const conflictingResults = await ExamResult.find({
        exam: id,
        isAbsent: false,
        marksObtained: { $gt: finalMax },
      }).populate('student', 'firstName lastName admissionNumber');

      if (conflictingResults.length > 0) {
        const highestScore = Math.max(...conflictingResults.map((r) => r.marksObtained));
        throw new ApiError(
          409,
          `Cannot reduce maximum marks to ${finalMax} because ${conflictingResults.length} existing student result(s) exceed this score (highest recorded: ${highestScore}). Please correct affected results before updating exam maximum marks.`
        );
      }
    }

    if (updateData.teacher !== undefined) {
      if (updateData.teacher === null || updateData.teacher === '') {
        existing.teacher = null;
      } else {
        existing.teacher = await this.validateTeacher(updateData.teacher);
      }
    }

    if (updateData.examDate !== undefined) {
      const { dateObj, dateStr } = this.normalizeCalendarDate(updateData.examDate, 'Exam date');
      existing.examDate = dateObj;
      existing.examDateString = dateStr;
    }

    if (updateData.title !== undefined) {
      const t = String(updateData.title).trim();
      if (!t) throw new ApiError(400, 'Exam title cannot be empty');
      existing.title = t;
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

    if (updateData.examType !== undefined) {
      existing.examType = String(updateData.examType).trim().toLowerCase();
    }

    if (updateData.startTime !== undefined) {
      existing.startTime = String(updateData.startTime).trim();
    }

    if (updateData.durationMinutes !== undefined) {
      const d = Number(updateData.durationMinutes);
      if (isNaN(d) || d < 1) throw new ApiError(400, 'Duration must be at least 1 minute');
      existing.durationMinutes = d;
    }

    if (updateData.instructions !== undefined) {
      existing.instructions = String(updateData.instructions).trim();
    }

    if (updateData.status !== undefined) {
      existing.status = String(updateData.status).trim().toLowerCase();
    }

    existing.maxMarks = finalMax;
    existing.passingMarks = finalPass;

    await existing.save();

    // If maxMarks or passingMarks changed, re-evaluate percentages and pass/fail statuses for non-absent results
    if (updateData.maxMarks !== undefined || updateData.passingMarks !== undefined) {
      const resultsToUpdate = await ExamResult.find({ exam: id, isAbsent: false });
      for (const res of resultsToUpdate) {
        res.percentage = Number(((res.marksObtained / finalMax) * 100).toFixed(1));
        res.status = res.marksObtained >= finalPass ? 'pass' : 'fail';
        await res.save();
      }
    }

    return await Exam.findById(id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );
  }

  /**
   * Delete an exam and all its associated results safely
   * Uses a transaction if the deployment supports it, with clean non-transactional fallback
   */
  async deleteExam(id) {
    this.validateId(id, 'exam');

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new ApiError(404, `Exam with ID "${id}" not found`);
    }

    let session = null;
    let transactionCommitted = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      await ExamResult.deleteMany({ exam: id }, { session });
      await Exam.findByIdAndDelete(id, { session });
      await session.commitTransaction();
      transactionCommitted = true;
    } catch (err) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (_) {}
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // Fallback if standalone MongoDB doesn't support transactions
    if (!transactionCommitted) {
      await ExamResult.deleteMany({ exam: id });
      await Exam.findByIdAndDelete(id);
    }

    return exam;
  }

  /**
   * List exams with search and filters
   */
  async getAllExams(query = {}) {
    const {
      search,
      className,
      section,
      subject,
      examType,
      status,
      examDate,
      teacher,
      sortBy = 'examDate',
      order = 'desc',
    } = query;

    const filter = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { subject: searchRegex }, { instructions: searchRegex }];
    }

    if (className && className.trim()) {
      filter.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
    }

    // Section filtering: If specific section requested, return matching section OR all-sections exams ('')
    if (section && section.trim()) {
      const sec = section.trim().toUpperCase();
      filter.section = { $in: [sec, ''] };
    }

    if (subject && subject.trim()) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
    }

    if (examType && examType.trim()) {
      filter.examType = examType.trim().toLowerCase();
    }

    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    if (teacher && teacher.trim()) {
      this.validateId(teacher.trim(), 'teacher');
      filter.teacher = teacher.trim();
    }

    if (examDate) {
      const { dateObj } = this.normalizeCalendarDate(examDate, 'Exam date');
      const nextDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
      filter.examDate = { $gte: dateObj, $lt: nextDay };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const exams = await Exam.find(filter)
      .populate('teacher', 'firstName lastName employeeId subject specialization email phone')
      .sort(sortObj);

    const total = await Exam.countDocuments(filter);

    return {
      exams,
      total,
    };
  }

  /**
   * Get single exam by ID
   */
  async getExamById(id) {
    this.validateId(id, 'exam');

    const exam = await Exam.findById(id).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );

    if (!exam) {
      throw new ApiError(404, `Exam with ID "${id}" not found`);
    }

    return exam;
  }

  /**
   * Helper to ensure exam results are not currently published before allowing any modifications.
   */
  assertExamResultsNotPublished(exam) {
    if (exam && exam.isResultPublished) {
      throw new ApiError(
        400,
        'Cannot modify results for a published exam. An administrator must unpublish results before making changes.'
      );
    }
  }

  /**
   * Helper to validate student eligibility and compute marks
   */
  validateAndCalculateResult(exam, student, item) {
    // Validate student class matches exam class
    if (student.className.toLowerCase() !== exam.className.toLowerCase()) {
      throw new ApiError(
        400,
        `Student ${student.firstName} ${student.lastName} (${student.admissionNumber}) is enrolled in "${student.className}", which does not match exam class "${exam.className}".`
      );
    }

    // Validate section (an exam targeting all sections accepts any section)
    if (exam.section && student.section && student.section.toUpperCase() !== exam.section.toUpperCase()) {
      throw new ApiError(
        400,
        `Student ${student.firstName} ${student.lastName} (${student.admissionNumber}) belongs to section "${student.section}", which does not match exam section "${exam.section}".`
      );
    }

    const isAbsent = Boolean(item.isAbsent);
    let marksObtained = 0;
    let percentage = 0;
    let status = 'absent';

    if (isAbsent) {
      marksObtained = 0;
      percentage = 0;
      status = 'absent';
    } else {
      marksObtained = Number(item.marksObtained !== undefined ? item.marksObtained : 0);
      if (isNaN(marksObtained) || marksObtained < 0 || marksObtained > exam.maxMarks) {
        throw new ApiError(
          400,
          `Marks obtained for student ${student.admissionNumber} (${marksObtained}) must be between 0 and maximum marks (${exam.maxMarks}).`
        );
      }
      percentage = Number(((marksObtained / exam.maxMarks) * 100).toFixed(1));
      status = marksObtained >= exam.passingMarks ? 'pass' : 'fail';
    }

    return {
      marksObtained,
      isAbsent,
      percentage,
      status,
      remarks: item.remarks ? String(item.remarks).trim() : '',
      className: student.className,
      section: student.section || '',
    };
  }

  /**
   * Record single student result for an exam
   */
  async recordStudentResult(examId, data) {
    this.validateId(examId, 'exam');
    const { student: studentId, marksObtained, isAbsent = false, remarks = '', allowCorrection = false } = data;

    if (!studentId) throw new ApiError(400, 'Student ID is required');
    this.validateId(studentId, 'student');

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    this.assertExamResultsNotPublished(exam);

    const student = await Student.findById(studentId);
    if (!student) throw new ApiError(404, `Student with ID "${studentId}" not found`);

    const calculated = this.validateAndCalculateResult(exam, student, { marksObtained, isAbsent, remarks });

    const existing = await ExamResult.findOne({ exam: examId, student: studentId });
    if (existing) {
      if (!allowCorrection) {
        throw new ApiError(
          409,
          `Result for ${student.firstName} ${student.lastName} (${student.admissionNumber}) has already been recorded on this exam. Set allowCorrection to true to modify.`
        );
      }

      existing.marksObtained = calculated.marksObtained;
      existing.isAbsent = calculated.isAbsent;
      existing.percentage = calculated.percentage;
      existing.status = calculated.status;
      existing.remarks = calculated.remarks;
      existing.className = calculated.className;
      existing.section = calculated.section;
      await existing.save();

      return await ExamResult.findById(existing._id).populate(
        'student',
        'firstName lastName admissionNumber rollNumber className section'
      );
    }

    const newResult = new ExamResult({
      exam: examId,
      student: student._id,
      ...calculated,
    });

    const saved = await newResult.save();
    return await ExamResult.findById(saved._id).populate(
      'student',
      'firstName lastName admissionNumber rollNumber className section'
    );
  }

  /**
   * Bulk record results for a class roster
   * Safely handles existing records, explicit corrections, and conflict reporting
   */
  async bulkRecordResults(examId, payload) {
    this.validateId(examId, 'exam');
    const { results, allowCorrection = false } = payload;

    if (!results || !Array.isArray(results) || results.length === 0) {
      throw new ApiError(400, 'Results array is required');
    }

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    this.assertExamResultsNotPublished(exam);

    const studentIds = [];
    for (const item of results) {
      const sId = item.student || item.studentId;
      if (!sId) throw new ApiError(400, 'Each result item must include a student ID');
      this.validateId(sId, 'student');
      studentIds.push(sId);
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    for (const sId of studentIds) {
      if (!studentMap.has(sId.toString())) {
        throw new ApiError(404, `Student with ID "${sId}" does not exist`);
      }
    }

    // Check existing records on this exam
    const existingRecords = await ExamResult.find({
      exam: examId,
      student: { $in: studentIds },
    }).populate('student', 'firstName lastName admissionNumber rollNumber');

    if (existingRecords.length > 0 && !allowCorrection) {
      const conflicts = existingRecords.map((r) => ({
        studentId: r.student._id,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        admissionNumber: r.student.admissionNumber,
        recordedMarks: r.marksObtained,
        status: r.status,
      }));

      throw new ApiError(
        409,
        `Results have already been recorded for ${conflicts.length} student(s) on this exam. Set allowCorrection to true to modify existing scores.`,
        conflicts
      );
    }

    const existingMap = new Map(existingRecords.map((r) => [r.student._id.toString(), r]));
    let createdCount = 0;
    let updatedCount = 0;
    const processedIds = [];

    for (const item of results) {
      const sId = (item.student || item.studentId).toString();
      const student = studentMap.get(sId);
      const calculated = this.validateAndCalculateResult(exam, student, item);

      const existing = existingMap.get(sId);
      if (existing) {
        existing.marksObtained = calculated.marksObtained;
        existing.isAbsent = calculated.isAbsent;
        existing.percentage = calculated.percentage;
        existing.status = calculated.status;
        existing.remarks = calculated.remarks;
        existing.className = calculated.className;
        existing.section = calculated.section;
        await existing.save();
        updatedCount++;
        processedIds.push(existing._id);
      } else {
        const newResult = new ExamResult({
          exam: examId,
          student: student._id,
          ...calculated,
        });
        const saved = await newResult.save();
        createdCount++;
        processedIds.push(saved._id);
      }
    }

    const savedRecords = await ExamResult.find({ _id: { $in: processedIds } })
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .sort({ 'student.rollNumber': 1, 'student.firstName': 1 });

    return {
      examId,
      total: results.length,
      created: createdCount,
      updated: updatedCount,
      results: savedRecords,
    };
  }

  /**
   * Get all results for an exam
   */
  async getExamResults(examId, query = {}) {
    this.validateId(examId, 'exam');
    const { status, search } = query;

    const exam = await Exam.findById(examId).populate(
      'teacher',
      'firstName lastName employeeId subject specialization email phone'
    );
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    const filter = { exam: examId };
    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    let results = await ExamResult.find(filter)
      .populate('student', 'firstName lastName admissionNumber rollNumber className section')
      .sort({ 'student.rollNumber': 1, 'student.firstName': 1 });

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      results = results.filter((r) => {
        const s = r.student || {};
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const adm = (s.admissionNumber || '').toLowerCase();
        const roll = (s.rollNumber || '').toLowerCase();
        return fullName.includes(term) || adm.includes(term) || roll.includes(term);
      });
    }

    return {
      exam,
      total: results.length,
      results,
    };
  }

  /**
   * Get class performance statistics for an exam
   */
  async getExamStatistics(examId) {
    this.validateId(examId, 'exam');

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    const results = await ExamResult.find({ exam: examId });
    const recordedResults = results.length;

    let appeared = 0;
    let absent = 0;
    let passed = 0;
    let failed = 0;
    let sumMarks = 0;
    const appearedScores = [];

    const grades = {
      A_plus: 0, // >= 90%
      A: 0, // 80 - 89%
      B: 0, // 70 - 79%
      C: 0, // 60 - 69%
      D: 0, // passing to 59%
      F: 0, // < passing (failed)
    };

    for (const r of results) {
      if (r.isAbsent) {
        absent++;
      } else {
        appeared++;
        sumMarks += r.marksObtained;
        appearedScores.push(r.marksObtained);

        if (r.status === 'pass') {
          passed++;
        } else {
          failed++;
        }

        const pct = r.percentage;
        if (pct >= 90) grades.A_plus++;
        else if (pct >= 80) grades.A++;
        else if (pct >= 70) grades.B++;
        else if (pct >= 60) grades.C++;
        else if (r.status === 'pass') grades.D++;
        else grades.F++;
      }
    }

    // Safe zero denominator handling
    const passRate = appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;
    const averageMarks = appeared > 0 ? Number((sumMarks / appeared).toFixed(1)) : 0;
    const highestMarks = appeared > 0 ? Math.max(...appearedScores) : 0;
    const lowestMarks = appeared > 0 ? Math.min(...appearedScores) : 0;

    return {
      examId: exam._id,
      examTitle: exam.title,
      subject: exam.subject,
      className: exam.className,
      section: exam.section || 'All Sections',
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks,
      recordedResults,
      appeared,
      absent,
      passed,
      failed,
      passRate,
      averageMarks,
      highestMarks,
      lowestMarks,
      gradeDistribution: grades,
    };
  }

  /**
   * Update a specific result by ID
   */
  async updateResult(examId, resultId, updateData) {
    this.validateId(examId, 'exam');
    this.validateId(resultId, 'result');

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    this.assertExamResultsNotPublished(exam);

    const result = await ExamResult.findOne({ _id: resultId, exam: examId }).populate('student');
    if (!result) throw new ApiError(404, `Result with ID "${resultId}" not found for this exam`);

    const student = result.student;
    const isAbsent = updateData.isAbsent !== undefined ? Boolean(updateData.isAbsent) : result.isAbsent;
    const marks = updateData.marksObtained !== undefined ? updateData.marksObtained : result.marksObtained;
    const remarks = updateData.remarks !== undefined ? updateData.remarks : result.remarks;

    const calculated = this.validateAndCalculateResult(exam, student, {
      isAbsent,
      marksObtained: marks,
      remarks,
    });

    result.marksObtained = calculated.marksObtained;
    result.isAbsent = calculated.isAbsent;
    result.percentage = calculated.percentage;
    result.status = calculated.status;
    result.remarks = calculated.remarks;
    await result.save();

    return await ExamResult.findById(resultId).populate(
      'student',
      'firstName lastName admissionNumber rollNumber className section'
    );
  }

  /**
   * Delete a specific result by ID
   */
  async deleteResult(examId, resultId) {
    this.validateId(examId, 'exam');
    this.validateId(resultId, 'result');

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, `Exam with ID "${examId}" not found`);

    this.assertExamResultsNotPublished(exam);

    const result = await ExamResult.findOneAndDelete({ _id: resultId, exam: examId });
    if (!result) throw new ApiError(404, `Result with ID "${resultId}" not found for this exam`);

    return result;
  }

  /**
   * Overview summary counts
   */
  async getExamSummary(query = {}) {
    const { className, section, subject } = query;
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

    const exams = await Exam.find(filter);
    const total = exams.length;

    let scheduled = 0;
    let ongoing = 0;
    let completed = 0;
    let cancelled = 0;

    for (const e of exams) {
      if (e.status === 'scheduled') scheduled++;
      else if (e.status === 'ongoing') ongoing++;
      else if (e.status === 'completed') completed++;
      else if (e.status === 'cancelled') cancelled++;
    }

    return {
      total,
      scheduled,
      ongoing,
      completed,
      cancelled,
    };
  }

  /**
   * Explicitly publish exam results (Admin only)
   * Results become eligible for parent access when enabled in future phases.
   */
  async publishExamResults(id, adminUserId) {
    this.validateId(id, 'exam');

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new ApiError(404, `Exam with ID "${id}" not found`);
    }

    exam.isResultPublished = true;
    exam.resultsPublishedAt = new Date();
    exam.resultsPublishedBy = adminUserId;

    await exam.save();

    return await Exam.findById(id)
      .populate('teacher', 'firstName lastName employeeId subject specialization email')
      .populate('resultsPublishedBy', 'name email role');
  }

  /**
   * Explicitly unpublish exam results (Admin only)
   * Restores exam to unpublished state.
   */
  async unpublishExamResults(id) {
    this.validateId(id, 'exam');

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new ApiError(404, `Exam with ID "${id}" not found`);
    }

    exam.isResultPublished = false;
    exam.resultsPublishedAt = null;
    exam.resultsPublishedBy = null;

    await exam.save();

    return await Exam.findById(id)
      .populate('teacher', 'firstName lastName employeeId subject specialization email');
  }
}

module.exports = new ExamService();
