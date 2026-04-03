const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be at most 100 characters'),
  date: z.coerce.date({ errorMap: () => ({ message: 'Invalid date format' }) }),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').optional(),
  type: z
    .enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
    })
    .optional(),
  category: z.string().min(1).max(100).optional(),
  date: z.coerce.date({ errorMap: () => ({ message: 'Invalid date format' }) }).optional(),
  notes: z.string().max(500).optional(),
});

const recordQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = { createRecordSchema, updateRecordSchema, recordQuerySchema };
