/**
 * 404 catch-all — must be registered after all routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;
