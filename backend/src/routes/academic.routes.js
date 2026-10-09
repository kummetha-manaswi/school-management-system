const express = require('express');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');

const router = express.Router();

/**
 * Developer 1: Academic & Parent Domain Route Mount Point
 */

// Student Management routes: /api/academic/students
router.use('/students', studentRoutes);

// Teacher Management routes: /api/academic/teachers
router.use('/teachers', teacherRoutes);

// Academic domain status
router.get('/status', (req, res) => {
  res.status(200).json({
    module: 'academic',
    status: 'active',
    submodules: ['students', 'teachers'],
    message: 'Academic & Parent module online',
  });
});

module.exports = router;
