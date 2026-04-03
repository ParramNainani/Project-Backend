const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Create a new financial record.
 */
const createRecord = async (data, userId) => {
  const record = await prisma.record.create({
    data: {
      ...data,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return record;
};

/**
 * Get records with filters, sorting, and pagination.
 */
const getRecords = async ({ page, limit, type, category, startDate, endDate, sortBy, sortOrder }) => {
  const where = { isDeleted: false };

  if (type) where.type = type;
  if (category) where.category = { contains: category, mode: 'insensitive' };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.record.count({ where }),
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update an existing record.
 */
const updateRecord = async (id, data) => {
  const existing = await prisma.record.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    throw ApiError.notFound('Record not found');
  }

  const record = await prisma.record.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return record;
};

/**
 * Soft-delete a record.
 */
const deleteRecord = async (id) => {
  const existing = await prisma.record.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    throw ApiError.notFound('Record not found');
  }

  await prisma.record.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { id, deleted: true };
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
