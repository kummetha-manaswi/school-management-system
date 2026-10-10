const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Parent = require('../models/parent.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Generates a signed, expiring JWT for authenticated staff members
   */
  generateToken(user) {
    if (!env.JWT_SECRET) {
      throw new ApiError(500, 'Server configuration error: JWT_SECRET is not configured');
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      teacherId: user.teacher ? user.teacher.toString() : null,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Authenticates staff (Admin or Teacher) credentials and issues a JWT session token
   */
  async loginStaff(credentials) {
    const { email, password } = credentials || {};

    if (!email || !String(email).trim()) {
      throw new ApiError(400, 'Email address is required');
    }
    if (!password || !String(password).trim()) {
      throw new ApiError(400, 'Password is required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Query user and explicitly include passwordHash
    const user = await User.findOne({ email: normalizedEmail })
      .select('+passwordHash')
      .populate('teacher', 'firstName lastName employeeId subject specialization email phone');

    // Uniform authentication failure response to prevent user enumeration
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check account status
    if (user.status !== 'active') {
      throw new ApiError(
        403,
        'Your staff account is currently inactive. Please contact the school administrator.'
      );
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Issue JWT
    const token = this.generateToken(user);

    // Convert to plain object, removing passwordHash
    const userJson = user.toJSON();

    return {
      user: userJson,
      token,
    };
  }

  /**
   * Retrieve currently authenticated user profile
   */
  async getStaffProfile(userId) {
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    const user = await User.findById(userId)
      .populate('teacher', 'firstName lastName employeeId subject specialization email phone');

    if (!user) {
      throw new ApiError(404, 'Staff account not found');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, 'Your staff account is currently inactive');
    }

    return user;
  }

  /**
   * Generates a signed, expiring JWT for authenticated parent users
   */
  generateParentToken(parent) {
    if (!env.JWT_SECRET) {
      throw new ApiError(500, 'Server configuration error: JWT_SECRET is not configured');
    }

    const payload = {
      userId: parent._id.toString(),
      parentId: parent._id.toString(),
      role: 'parent',
      email: parent.email,
      name: `${parent.firstName} ${parent.lastName}`.trim(),
      tokenVersion: parent.tokenVersion || 0,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Authenticates parent credentials and issues a JWT session token
   */
  async loginParent(credentials) {
    const { email, password } = credentials || {};

    if (!email || !String(email).trim()) {
      throw new ApiError(400, 'Email address is required');
    }
    if (!password || !String(password).trim()) {
      throw new ApiError(400, 'Password is required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Query parent and explicitly include passwordHash
    const parent = await Parent.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Uniform authentication failure to prevent user enumeration
    if (!parent) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await parent.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check account status
    if (parent.status !== 'active') {
      throw new ApiError(
        403,
        `Your parent account is currently ${parent.status}. Please contact the school administration.`
      );
    }

    // Update lastLogin timestamp
    parent.lastLogin = new Date();
    await parent.save();

    const token = this.generateParentToken(parent);

    const parentData = parent.toJSON();
    parentData.role = 'parent';

    return {
      parent: parentData,
      user: {
        id: parent._id.toString(),
        name: `${parent.firstName} ${parent.lastName}`.trim(),
        email: parent.email,
        role: 'parent',
        status: parent.status,
      },
      token,
    };
  }

  /**
   * Retrieve currently authenticated parent profile
   */
  async getParentProfile(parentId) {
    if (!parentId) {
      throw new ApiError(400, 'Parent ID is required');
    }

    const parent = await Parent.findById(parentId);

    if (!parent) {
      throw new ApiError(404, 'Parent account not found');
    }

    if (parent.status !== 'active') {
      throw new ApiError(403, `Your parent account is currently ${parent.status}`);
    }

    const parentData = parent.toJSON();
    parentData.role = 'parent';
    return parentData;
  }
}

module.exports = new AuthService();
