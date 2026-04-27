/**
 * Global error handler — catches all errors forwarded via next(err).
 * Must have exactly 4 parameters for Express to recognise it as error middleware.
 * Always returns JSON (never HTML).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Mongoose: invalid ObjectId or type cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
  }

  // Mongoose: duplicate unique key (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} đã tồn tại`;
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  const response = { success: false, error: message };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
