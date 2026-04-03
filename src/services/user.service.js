const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * List users with pagination and optional filters.
 */
const listUsers = async ({ page, limit, role, status }) => {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update a user's role.
 */
const updateRole = async (userId, role, requestingUser) => {
  if (userId === requestingUser.id) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  return updated;
};

/**
 * Update a user's status (activate / deactivate).
 */
const updateStatus = async (userId, status, requestingUser) => {
  if (userId === requestingUser.id) {
    throw ApiError.badRequest('You cannot change your own status');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  return updated;
};

module.exports = { listUsers, updateRole, updateStatus };
