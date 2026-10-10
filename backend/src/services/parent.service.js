const mongoose = require('mongoose');
const { Parent, ParentStudent, Student } = require('../models');
const ApiError = require('../utils/ApiError');

class ParentService {
  validateId(id, label = 'record') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid ${label} ID format: "${id}"`);
    }
  }

  /**
   * Create a new parent account (Admin only)
   */
  async createParent(data) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone = '',
      address = '',
      city = '',
      state = '',
      pincode = '',
      occupation = '',
      status = 'active',
    } = data || {};

    if (!firstName || !String(firstName).trim()) {
      throw new ApiError(400, 'Parent first name is required');
    }
    if (!lastName || !String(lastName).trim()) {
      throw new ApiError(400, 'Parent last name is required');
    }
    if (!email || !String(email).trim()) {
      throw new ApiError(400, 'Email address is required');
    }
    if (!password || String(password).length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check for existing parent account with this email
    const existing = await Parent.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ApiError(409, `A parent account with email "${normalizedEmail}" already exists`);
    }

    const passwordHash = await Parent.hashPassword(password);

    const parent = new Parent({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      passwordHash,
      address: String(address).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      occupation: String(occupation).trim(),
      status: ['active', 'inactive', 'suspended'].includes(status) ? status : 'active',
    });

    await parent.save();

    // Returns plain object without passwordHash
    return parent.toJSON();
  }

  /**
   * List and search parent accounts with pagination
   */
  async getAllParents(query = {}) {
    const {
      search,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = {};

    if (search && String(search).trim()) {
      const term = String(search).trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['createdAt', 'firstName', 'lastName', 'email'].includes(sortBy) ? sortBy : 'createdAt';

    const parents = await Parent.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const total = await Parent.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Get count of linked students for each parent in the result set
    const parentIds = parents.map((p) => p._id);
    const relationshipCounts = await ParentStudent.aggregate([
      { $match: { parent: { $in: parentIds }, status: { $ne: 'revoked' } } },
      { $group: { _id: '$parent', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    relationshipCounts.forEach((r) => countMap.set(r._id.toString(), r.count));

    const parentsWithCounts = parents.map((p) => {
      const json = p.toJSON();
      json.linkedStudentsCount = countMap.get(p._id.toString()) || 0;
      return json;
    });

    return {
      parents: parentsWithCounts,
      total,
      page: pageNum,
      totalPages,
    };
  }

  /**
   * Get single parent details along with linked students
   */
  async getParentById(id) {
    this.validateId(id, 'parent');

    const parent = await Parent.findById(id);
    if (!parent) {
      throw new ApiError(404, `Parent with ID "${id}" not found`);
    }

    const relationships = await ParentStudent.find({ parent: id })
      .populate('student', 'firstName lastName admissionNumber rollNumber className section status')
      .populate('verifiedBy', 'name email role')
      .populate('revokedBy', 'name email role')
      .sort({ createdAt: -1 });

    return {
      parent: parent.toJSON(),
      relationships,
    };
  }

  /**
   * Update parent account
   */
  async updateParent(id, updateData = {}) {
    this.validateId(id, 'parent');

    const parent = await Parent.findById(id);
    if (!parent) {
      throw new ApiError(404, `Parent with ID "${id}" not found`);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      occupation,
      password,
    } = updateData;

    if (firstName !== undefined) parent.firstName = String(firstName).trim();
    if (lastName !== undefined) parent.lastName = String(lastName).trim();
    if (phone !== undefined) parent.phone = String(phone).trim();
    if (address !== undefined) parent.address = String(address).trim();
    if (city !== undefined) parent.city = String(city).trim();
    if (state !== undefined) parent.state = String(state).trim();
    if (pincode !== undefined) parent.pincode = String(pincode).trim();
    if (occupation !== undefined) parent.occupation = String(occupation).trim();

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail !== parent.email) {
        const emailTaken = await Parent.findOne({ email: normalizedEmail });
        if (emailTaken) {
          throw new ApiError(409, `Email "${normalizedEmail}" is already in use by another parent account`);
        }
        parent.email = normalizedEmail;
      }
    }

    if (password && String(password).trim()) {
      if (String(password).length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long');
      }
      parent.passwordHash = await Parent.hashPassword(password);
      parent.tokenVersion += 1; // Invalidate previous sessions
    }

    await parent.save();
    return parent.toJSON();
  }

  /**
   * Update parent account status (Deactivate / Suspend / Activate)
   */
  async updateParentStatus(id, newStatus) {
    this.validateId(id, 'parent');

    const formattedStatus = String(newStatus).toLowerCase().trim();
    if (!['active', 'inactive', 'suspended'].includes(formattedStatus)) {
      throw new ApiError(400, `Invalid status "${newStatus}". Allowed: active, inactive, suspended`);
    }

    const parent = await Parent.findById(id);
    if (!parent) {
      throw new ApiError(404, `Parent with ID "${id}" not found`);
    }

    parent.status = formattedStatus;
    if (formattedStatus !== 'active') {
      parent.tokenVersion += 1; // Invalidate active session tokens on deactivation
    }

    await parent.save();
    return parent.toJSON();
  }

  /**
   * Link a parent to a student
   * Validates both parent and student exist, ensures no duplicate active/verified link
   */
  async linkStudentToParent(parentId, studentId, linkData = {}, adminUserId = null) {
    this.validateId(parentId, 'parent');
    this.validateId(studentId, 'student');

    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw new ApiError(404, `Parent with ID "${parentId}" not found`);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, `Student with ID "${studentId}" not found`);
    }

    const { relationshipType = 'guardian', status = 'pending', notes = '' } = linkData;
    const initialStatus = status === 'verified' ? 'verified' : 'pending';

    // Check for existing relationship
    const existing = await ParentStudent.findOne({ parent: parentId, student: studentId });
    if (existing) {
      if (existing.status !== 'revoked') {
        throw new ApiError(
          409,
          `A ${existing.status} relationship between parent "${parent.fullName}" and student "${student.fullName}" already exists.`
        );
      }

      // If previously revoked, restore the link with fresh parameters
      existing.relationshipType = relationshipType;
      existing.status = initialStatus;
      existing.notes = notes;
      existing.createdBy = adminUserId;
      existing.revokedAt = null;
      existing.revokedBy = null;
      existing.revocationReason = '';

      if (initialStatus === 'verified') {
        existing.verifiedAt = new Date();
        existing.verifiedBy = adminUserId;
      } else {
        existing.verifiedAt = null;
        existing.verifiedBy = null;
      }

      await existing.save();
      return await existing.populate('student', 'firstName lastName admissionNumber className section status');
    }

    const newRel = new ParentStudent({
      parent: parentId,
      student: studentId,
      relationshipType,
      status: initialStatus,
      notes: String(notes).trim(),
      createdBy: adminUserId,
      verifiedAt: initialStatus === 'verified' ? new Date() : null,
      verifiedBy: initialStatus === 'verified' ? adminUserId : null,
    });

    await newRel.save();
    return await newRel.populate('student', 'firstName lastName admissionNumber className section status');
  }

  /**
   * Get all linked students for a parent
   */
  async getLinkedStudents(parentId) {
    this.validateId(parentId, 'parent');

    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw new ApiError(404, `Parent with ID "${parentId}" not found`);
    }

    return await ParentStudent.find({ parent: parentId })
      .populate('student', 'firstName lastName admissionNumber rollNumber className section status')
      .populate('verifiedBy', 'name email role')
      .populate('revokedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all linked parents for a student
   */
  async getLinkedParents(studentId) {
    this.validateId(studentId, 'student');

    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, `Student with ID "${studentId}" not found`);
    }

    return await ParentStudent.find({ student: studentId })
      .populate('parent', 'firstName lastName email phone status occupation')
      .populate('verifiedBy', 'name email role')
      .populate('revokedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Verify a relationship link (Admin only)
   */
  async verifyRelationship(relationshipId, adminUserId) {
    this.validateId(relationshipId, 'relationship');

    const rel = await ParentStudent.findById(relationshipId);
    if (!rel) {
      throw new ApiError(404, `Relationship with ID "${relationshipId}" not found`);
    }

    rel.status = 'verified';
    rel.verifiedAt = new Date();
    rel.verifiedBy = adminUserId;
    rel.revokedAt = null;
    rel.revokedBy = null;
    rel.revocationReason = '';

    await rel.save();

    return await ParentStudent.findById(relationshipId)
      .populate('parent', 'firstName lastName email phone status')
      .populate('student', 'firstName lastName admissionNumber className section status')
      .populate('verifiedBy', 'name email role');
  }

  /**
   * Revoke a relationship link (Admin only)
   */
  async revokeRelationship(relationshipId, adminUserId, reason = '') {
    this.validateId(relationshipId, 'relationship');

    const rel = await ParentStudent.findById(relationshipId);
    if (!rel) {
      throw new ApiError(404, `Relationship with ID "${relationshipId}" not found`);
    }

    rel.status = 'revoked';
    rel.revokedAt = new Date();
    rel.revokedBy = adminUserId;
    rel.revocationReason = String(reason).trim() || 'Revoked by administrator';

    await rel.save();

    return await ParentStudent.findById(relationshipId)
      .populate('parent', 'firstName lastName email phone status')
      .populate('student', 'firstName lastName admissionNumber className section status')
      .populate('revokedBy', 'name email role');
  }
}

module.exports = new ParentService();
