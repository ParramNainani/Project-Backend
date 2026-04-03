const ApiError = require('../utils/ApiError');

/**
 * Creates a middleware that validates req.body (or req.query)
 * against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }

    // Set validated data into a safe custom property
    if (source === 'query') {
      req.validatedQuery = result.data;
    } else if (source === 'body') {
      req.body = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
};

module.exports = validate;
