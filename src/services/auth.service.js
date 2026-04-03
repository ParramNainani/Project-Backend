const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Register a new user with VIEWER role.
 */
const register = async ({ email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: 'VIEWER' },
    select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
  });

  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Authenticate a user and return a JWT.
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'INACTIVE') {
    throw ApiError.forbidden('Account has been deactivated');
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
    token,
  };
};

/**
 * Generate a JWT for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

module.exports = { register, login };
