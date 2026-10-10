const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  /**
   * POST /api/auth/staff/login
   */
  async loginStaff(req, res, next) {
    try {
      const result = await authService.loginStaff(req.body);
      res
        .status(200)
        .json(new ApiResponse(200, result, 'Staff logged in successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/staff/me
   */
  async getStaffProfile(req, res, next) {
    try {
      const user = await authService.getStaffProfile(req.user?.userId);
      res
        .status(200)
        .json(new ApiResponse(200, user, 'Staff profile fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/parent/login
   */
  async loginParent(req, res, next) {
    try {
      const result = await authService.loginParent(req.body);
      res
        .status(200)
        .json(new ApiResponse(200, result, 'Parent logged in successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/parent/me
   */
  async getParentProfile(req, res, next) {
    try {
      const parentId = req.parent?._id || req.user?.parentId || req.user?.userId;
      const parent = await authService.getParentProfile(parentId);
      res
        .status(200)
        .json(new ApiResponse(200, parent, 'Parent profile fetched successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
