const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

/**
 * Authentication Middleware
 *
 * Verifies Bearer JWT signature, expiration, and user account status.
 * Attaches verified claims to req.user: { userId, role, email, teacherId }
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new ApiError(401, 'Authentication required. No Bearer token provided.')
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(
        new ApiError(401, 'Authentication token missing.')
      );
    }

    if (!env.JWT_SECRET) {
      return next(
        new ApiError(500, 'Server configuration error: JWT_SECRET is not configured.')
      );
    }

    // Verify token signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Session token expired. Please log in again.'));
      }
      return next(new ApiError(401, 'Invalid authentication token.'));
    }

    if (!decoded || !decoded.userId || !decoded.role) {
      return next(new ApiError(401, 'Invalid token payload: missing user claims.'));
    }

    // Attach verified user claims to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      teacherId: decoded.teacherId || null,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Validates that the authenticated user possesses one of the allowed roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new ApiError(401, 'Authentication required before verifying role permissions.')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role "${req.user.role}" does not have permission to access this resource. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

const {
  authenticateParent,
  authorizeParentChild,
} = require('./parentAuth');

module.exports = {
  authenticate,
  authorizeRoles,
  authenticateParent,
  authorizeParentChild,
};
