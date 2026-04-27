/**
 * Wraps async route handlers so errors are forwarded to Express error middleware.
 * Eliminates try/catch boilerplate in every controller.
 */
const asyncWrapper = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncWrapper;
