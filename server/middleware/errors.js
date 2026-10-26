const { httpError } = require('../utils/http');

function notFound(req, _res, next) {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Something went wrong.';

  if (error.name === 'CastError') {
    status = 400;
    message = 'That record could not be found.';
  }

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(' ');
  }

  if (error.code === 11000) {
    status = 409;
    if (error.keyPattern?.email) {
      message = 'An account with that email already exists.';
    } else {
      message = 'That time slot was just booked by someone else. Please pick another.';
    }
  }

  if (status >= 500) {
    console.error('[api]', error);
  }

  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong.' : message,
  });
}

module.exports = { notFound, errorHandler };
