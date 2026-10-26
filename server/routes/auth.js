const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');
const { asyncHandler, httpError } = require('../utils/http');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body || {};

    if (!String(name || '').trim() || String(name).trim().length < 2) {
      throw httpError(400, 'Please enter your full name.');
    }
    if (!EMAIL_REGEX.test(normalizeEmail(email))) {
      throw httpError(400, 'Please enter a valid email address.');
    }
    if (String(password || '').length < 8) {
      throw httpError(400, 'Password must be at least 8 characters long.');
    }

    const existing = await User.findOne({ email: normalizeEmail(email) });
    if (existing) {
      throw httpError(409, 'An account with that email already exists.');
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizeEmail(email),
      password: String(password),
      phone: String(phone || '').trim(),
      role: 'user',
    });

    res.status(201).json({
      token: signToken(user),
      user: user.toSafeObject(),
    });
  }),
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!EMAIL_REGEX.test(normalizeEmail(email)) || !password) {
      throw httpError(400, 'Enter your email and password.');
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');
    if (!user || !(await user.comparePassword(String(password)))) {
      throw httpError(401, 'The email or password is incorrect.');
    }

    res.json({
      token: signToken(user),
      user: user.toSafeObject(),
    });
  }),
);

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeObject() });
  }),
);

router.patch(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body || {};

    if (name !== undefined) {
      if (String(name).trim().length < 2) {
        throw httpError(400, 'Name must be at least 2 characters.');
      }
      req.user.name = String(name).trim();
    }

    if (phone !== undefined) {
      req.user.phone = String(phone).trim().slice(0, 24);
    }

    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  }),
);

module.exports = router;
