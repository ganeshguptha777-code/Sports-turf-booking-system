const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../utils/http');

function tokenSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }
  return secret || 'turfbook-local-development-secret';
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, tokenSecret(), {
    expiresIn: '7d',
    issuer: 'turfbook',
  });
}

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw httpError(401, 'Please sign in to continue.');
  }

  let payload;
  try {
    payload = jwt.verify(token, tokenSecret(), { issuer: 'turfbook' });
  } catch (_error) {
    throw httpError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw httpError(401, 'This account no longer exists.');
  }

  req.user = user;
  next();
});

function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(httpError(403, 'Admin access is required for this action.'));
  }
  return next();
}

module.exports = { protect, adminOnly, signToken };
