const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Verify JWT token and attach user to request.
 */
const requireAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(error);
  }
};

/**
 * Role-based access control middleware.
 * @param  {...string} roles - Allowed roles (e.g. 'ADMIN', 'ANALYST')
 */
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access denied. Required role(s): ${roles.join(', ')}`)
      );
    }
    next();
  };
};

module.exports = { requireAuth, restrictTo };
