const mongoose = require('mongoose');
const {
  Parent,
  ParentStudent,
  Student,
  Attendance,
  Assignment,
  Exam,
  ExamResult,
} = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Service handling secure, read-only academic and profile queries for parents.
 * 
 * PRIVACY & SCOPING POLICIES:
 * - Scoped strictly to verified children of the authenticated parent.
 * - Strict field whitelists: never exposes password hashes, internal DB metadata,
 *   private staff details, or Teacher Notes.
 * - Exam marks are exposed ONLY when `isResultPublished === true`.
 * - Read-only: no parent mutations are accepted on academic records.
 */
class ParentAcademicService {
  /**
   * Aggregate overview dashboard for authenticated parent
   */
  async getParentDashboardSummary(parentId) {
    const verifiedLinks = await ParentStudent.find({
      parent: parentId,
      status: 'verified',
    })
      .populate('student', 'firstName lastName admissionNumber rollNumber className section status')
      .sort({ createdAt: 1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    const childrenSummary = [];

    for (const link of verifiedLinks) {
      const student = link.student;
      if (!student) continue;

      // Query today's attendance if marked
      const todayAttendance = await Attendance.findOne({
        student: student._id,
        dateString: todayStr,
      }).select('status remarks dateString');

      // Count active published assignments for child's class & section
      const activeAssignmentsCount = await Assignment.countDocuments({
        className: { $regex: new RegExp(`^${student.className}$`, 'i') },
        section: { $in: [student.section ? student.section.toUpperCase() : '', ''] },
        status: 'published',
        dueDate: { $gte: todayDate },
      });

      // Count upcoming exams for child's class & section
      const upcomingExamsCount = await Exam.countDocuments({
        className: { $regex: new RegExp(`^${student.className}$`, 'i') },
        section: { $in: [student.section ? student.section.toUpperCase() : '', ''] },
        status: { $in: ['scheduled', 'ongoing'] },
        examDate: { $gte: todayDate },
      });

      // Count published exam results available for this child
      const publishedExams = await Exam.find({
        className: { $regex: new RegExp(`^${student.className}$`, 'i') },
        section: { $in: [student.section ? student.section.toUpperCase() : '', ''] },
        isResultPublished: true,
      }).select('_id');

      const publishedExamIds = publishedExams.map((e) => e._id);
      const publishedResultsCount = await ExamResult.countDocuments({
        student: student._id,
        exam: { $in: publishedExamIds },
      });

      childrenSummary.push({
        studentId: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber || null,
        className: student.className,
        section: student.section,
        relationshipType: link.relationshipType,
        todayAttendance: todayAttendance
          ? { status: todayAttendance.status, remarks: todayAttendance.remarks }
          : { status: 'not_recorded', remarks: '' },
        activeAssignmentsCount,
        upcomingExamsCount,
        publishedResultsCount,
      });
    }

    return {
      verifiedChildrenCount: childrenSummary.length,
      children: childrenSummary,
    };
  }

  /**
   * Get all verified linked children for authenticated parent
   */
  async getVerifiedChildren(parentId) {
    const relationships = await ParentStudent.find({
      parent: parentId,
      status: 'verified',
    })
      .populate(
        'student',
        'firstName lastName admissionNumber rollNumber className section gender dateOfBirth bloodGroup status'
      )
      .sort({ createdAt: 1 });

    return relationships
      .filter((rel) => Boolean(rel.student))
      .map((rel) => {
        const s = rel.student;
        return {
          studentId: s._id,
          firstName: s.firstName,
          lastName: s.lastName,
          admissionNumber: s.admissionNumber,
          rollNumber: s.rollNumber || null,
          className: s.className,
          section: s.section,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth,
          bloodGroup: s.bloodGroup || null,
          status: s.status,
          relationshipType: rel.relationshipType,
          verifiedAt: rel.verifiedAt,
        };
      });
  }

  /**
   * Get child profile with strict field whitelist
   */
  async getChildProfile(student, relationship) {
    return {
      studentId: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber || null,
      className: student.className,
      section: student.section,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup || null,
      status: student.status,
      relationshipType: relationship?.relationshipType || 'guardian',
      verifiedAt: relationship?.verifiedAt || null,
    };
  }

  /**
   * Get child attendance history and summary statistics
   */
  async getChildAttendance(student, query = {}) {
    const { startDate, endDate, month, year, page = 1, limit = 50 } = query;

    const filter = { student: student._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const sDate = new Date(`${String(startDate).trim()}T00:00:00.000Z`);
        if (!isNaN(sDate.getTime())) filter.date.$gte = sDate;
      }
      if (endDate) {
        const eDate = new Date(`${String(endDate).trim()}T23:59:59.999Z`);
        if (!isNaN(eDate.getTime())) filter.date.$lte = eDate;
      }
    } else if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12) {
        const firstDay = new Date(Date.UTC(y, m - 1, 1));
        const lastDay = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
        filter.date = { $gte: firstDay, $lte: lastDay };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [allRecordsForStats, paginatedRecords, total] = await Promise.all([
      Attendance.find(filter).select('status'),
      Attendance.find(filter)
        .select('date dateString status remarks')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(filter),
    ]);

    // Compute summary statistics
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    for (const r of allRecordsForStats) {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    }

    const totalDays = allRecordsForStats.length;
    const attendanceRate =
      totalDays > 0 ? Number((((present + late) / totalDays) * 100).toFixed(1)) : 0;

    return {
      summary: {
        totalDays,
        present,
        absent,
        late,
        excused,
        attendanceRate,
      },
      records: paginatedRecords.map((r) => ({
        id: r._id,
        date: r.date,
        dateString: r.dateString,
        status: r.status,
        remarks: r.remarks || '',
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get published assignments relevant to child's class and section
   */
  async getChildAssignments(student, query = {}) {
    const { subject, page = 1, limit = 30 } = query;

    const filter = {
      className: { $regex: new RegExp(`^${student.className}$`, 'i') },
      section: { $in: [student.section ? student.section.toUpperCase() : '', ''] },
      status: { $in: ['published', 'completed'] }, // Strictly exclude 'draft'
    };

    if (subject && String(subject).trim()) {
      filter.subject = { $regex: new RegExp(`^${String(subject).trim()}$`, 'i') };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .select('title description subject assignedDate assignedDateString dueDate dueDateString maxMarks status attachments createdAt')
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Assignment.countDocuments(filter),
    ]);

    const sanitizedAssignments = assignments.map((a) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const isOverdue = a.status === 'published' && a.dueDateString && a.dueDateString < todayStr;

      return {
        id: a._id,
        title: a.title,
        description: a.description || '',
        subject: a.subject,
        assignedDate: a.assignedDate,
        assignedDateString: a.assignedDateString,
        dueDate: a.dueDate,
        dueDateString: a.dueDateString,
        maxMarks: a.maxMarks,
        status: a.status,
        isOverdue,
        attachments: (a.attachments || []).map((att) => ({
          title: att.title || '',
          url: att.url,
        })),
        createdAt: a.createdAt,
      };
    });

    return {
      assignments: sanitizedAssignments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get exams and results for child.
   * STRICT POLICY: Marks, percentage, pass/fail status, and remarks are exposed
   * ONLY when exam.isResultPublished === true.
   */
  async getChildExamsAndResults(student, query = {}) {
    const { examType, academicYear } = query;

    const filter = {
      className: { $regex: new RegExp(`^${student.className}$`, 'i') },
      section: { $in: [student.section ? student.section.toUpperCase() : '', ''] },
      status: { $ne: 'cancelled' },
    };

    if (examType && String(examType).trim()) {
      filter.examType = String(examType).trim().toLowerCase();
    }
    if (academicYear && String(academicYear).trim()) {
      filter.academicYear = String(academicYear).trim();
    }

    const exams = await Exam.find(filter).sort({ examDate: -1 });

    const examIds = exams.map((e) => e._id);
    const results = await ExamResult.find({
      exam: { $in: examIds },
      student: student._id,
    });

    const resultMap = new Map(results.map((r) => [r.exam.toString(), r]));

    const response = exams.map((exam) => {
      const isPublished = Boolean(exam.isResultPublished);
      const studentResult = resultMap.get(exam._id.toString());

      const item = {
        examId: exam._id,
        title: exam.title,
        subject: exam.subject,
        examType: exam.examType,
        academicYear: exam.academicYear,
        className: exam.className,
        section: exam.section || 'All Sections',
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        maxMarks: exam.maxMarks,
        passingMarks: exam.passingMarks,
        isResultPublished: isPublished,
      };

      if (isPublished) {
        item.resultsPublishedAt = exam.resultsPublishedAt;
        if (studentResult) {
          item.result = {
            marksObtained: studentResult.isAbsent ? 0 : studentResult.marksObtained,
            percentage: studentResult.isAbsent ? 0 : studentResult.percentage,
            status: studentResult.status, // 'pass', 'fail', 'absent'
            isAbsent: Boolean(studentResult.isAbsent),
            remarks: studentResult.remarks || '',
          };
        } else {
          item.result = null; // Result not yet recorded by staff
        }
      } else {
        // STRICT PRIVACY SAFEGUARD: Completely omit marks, percentages, and results object
        // when exam results are unpublished.
        item.result = null;
      }

      return item;
    });

    return {
      total: response.length,
      exams: response,
    };
  }

  /**
   * Get authenticated parent's own profile
   */
  async getParentProfile(parentId) {
    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw new ApiError(404, 'Parent account not found');
    }
    return parent.toJSON();
  }
}

module.exports = new ParentAcademicService();
