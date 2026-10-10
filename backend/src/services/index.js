const studentService = require('./student.service');
const teacherService = require('./teacher.service');
const attendanceService = require('./attendance.service');
const assignmentService = require('./assignment.service');
const examService = require('./exam.service');
const noteService = require('./note.service');
const authService = require('./auth.service');
const parentService = require('./parent.service');
const parentAcademicService = require('./parentAcademic.service');

module.exports = {
  studentService,
  teacherService,
  attendanceService,
  assignmentService,
  examService,
  noteService,
  authService,
  parentService,
  parentAcademicService,
};
