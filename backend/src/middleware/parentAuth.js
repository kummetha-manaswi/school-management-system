const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const Parent = require('../models/parent.model');
const ParentStudent = require('../models/parentStudent.model');
const Student = require('../models/student.model');

/**
 * Parent Authentication Middleware
 *
 * Verifies Bearer JWT signature, verifies explicit 'parent' role claim,
 * confirms Parent account exists and remains active, and validates session tokenVersion.
 *
 * SECURITY POLICY:
 * - Strictly rejects non-parent tokens (e.g. staff tokens cannot authenticate as parent).
 * - Strictly rejects inactive or suspended parent accounts.
 * - Enforces session invalidation when tokenVersion mismatches.
 */
const authenticateParent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new ApiError(401, 'Authentication required. No Bearer token provided.')
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError(401, 'Authentication token missing.'));
    }

    if (!env.JWT_SECRET) {
      return next(
        new ApiError(500, 'Server configuration error: JWT_SECRET is not configured.')
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Session token expired. Please log in again.'));
      }
      return next(new ApiError(401, 'Invalid authentication token.'));
    }

    // Role check: Strictly reject staff tokens and any non-parent roles
    if (!decoded || decoded.role !== 'parent') {
      return next(
        new ApiError(
          403,
          'Access denied. Valid parent authentication required. Staff tokens cannot access parent services.'
        )
      );
    }

    const parentId = decoded.parentId || decoded.userId;
    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      return next(new ApiError(401, 'Invalid token payload: missing parent claims.'));
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return next(new ApiError(401, 'Parent account not found or has been removed.'));
    }

    // Check account status
    if (parent.status !== 'active') {
      return next(
        new ApiError(
          403,
          `Your parent account is currently ${parent.status}. Please contact the school administration.`
        )
      );
    }

    // Session invalidation / tokenVersion verification
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== parent.tokenVersion) {
      return next(new ApiError(401, 'Session has been invalidated. Please log in again.'));
    }

    req.parent = parent;
    req.user = {
      userId: parent._id.toString(),
      parentId: parent._id.toString(),
      role: 'parent',
      email: parent.email,
      name: `${parent.firstName} ${parent.lastName}`,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Parent–Student Relationship Authorization Middleware
 *
 * Verifies that the authenticated parent has an active, administratively 'verified'
 * relationship with the requested student.
 *
 * PRIVACY & ANTI-ENUMERATION POLICY:
 * - If no relationship exists between this parent and the studentId (or student does not exist),
 *   returns a generic 404 response to prevent unauthenticated/unrelated student enumeration.
 * - If a relationship exists but status is 'pending' or 'revoked', returns 403 Forbidden.
 */
const authorizeParentChild = async (req, res, next) => {
  try {
    const parentId = req.parent?._id || req.user?.parentId;
    if (!parentId) {
      return next(new ApiError(401, 'Parent authentication required.'));
    }

    const studentId = req.params.studentId || req.params.id;
    if (!studentId) {
      return next(new ApiError(400, 'Student ID parameter is required.'));
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      // Prevents student enumeration: return 404 for invalid/unlinked
      return next(new ApiError(404, 'Student record not found or not linked to your parent account.'));
    }

    const relationship = await ParentStudent.findOne({
      parent: parentId,
      student: studentId,
    });

    if (!relationship) {
      // Anti-enumeration: unlinked or non-existent student IDs return identical 404
      return next(new ApiError(404, 'Student record not found or not linked to your parent account.'));
    }

    if (relationship.status !== 'verified') {
      return next(
        new ApiError(
          403,
          `Access denied: Parent-student relationship status is "${relationship.status}". Access to academic records requires an administratively verified relationship.`
        )
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return next(new ApiError(404, 'Student record not found or not linked to your parent account.'));
    }

    req.student = student;
    req.relationship = relationship;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateParent,
  authorizeParentChild,
};
