const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const academicRoutes = require('./academic.routes');
const operationsRoutes = require('./operations.routes');

const router = express.Router();

// Centralized API sub-route registration
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/academic', academicRoutes);
router.use('/operations', operationsRoutes);

module.exports = router;
