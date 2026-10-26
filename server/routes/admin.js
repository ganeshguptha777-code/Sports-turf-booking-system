const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { asyncHandler, httpError } = require('../utils/http');
const {
  addDays,
  getZonedNow,
  isValidDateString,
  isValidTimeString,
  timeToMinutes,
} = require('../utils/time');

const router = express.Router();
router.use(protect, adminOnly);

const ALLOWED_STATUSES = ['all', 'confirmed', 'cancelled'];

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const today = getZonedNow().date;
    const now = new Date();
    const since = new Date(now.getTime() - 6 * 86_400_000);
    since.setUTCHours(0, 0, 0, 0);

    const [totalBookings, todaysBookings, activeCourts, totalUsers, revenueResult, recentBookings, weeklyRaw, topCourts] =
      await Promise.all([
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.countDocuments({ status: 'confirmed', date: today }),
        Court.countDocuments({ active: true }),
        User.countDocuments({ role: 'user' }),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Booking.find({ status: 'confirmed' })
          .populate('user', 'name email')
          .populate('court', 'name sport location')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Booking.aggregate([
          { $match: { status: 'confirmed', createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: getZonedNow().timezone,
                },
              },
              bookings: { $sum: 1 },
              revenue: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: '$court', bookings: { $sum: 1 }, revenue: { $sum: '$amount' } } },
          { $sort: { bookings: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'courts',
              localField: '_id',
              foreignField: '_id',
              as: 'court',
            },
          },
          { $unwind: '$court' },
          {
            $project: {
              _id: 0,
              courtId: '$_id',
              name: '$court.name',
              sport: '$court.sport',
              bookings: 1,
              revenue: 1,
            },
          },
        ]),
      ]);

    const weeklyMap = new Map(weeklyRaw.map((item) => [item._id, item]));
    const weekly = Array.from({ length: 7 }, (_value, index) => {
      const date = addDays(today, index - 6);
      const entry = weeklyMap.get(date);
      return {
        date,
        bookings: entry?.bookings || 0,
        revenue: entry?.revenue || 0,
      };
    });

    res.json({
      stats: {
        totalBookings,
        todaysBookings,
        activeCourts,
        totalUsers,
        totalRevenue: revenueResult[0]?.total || 0,
        weekly,
        topCourts,
        recentBookings,
      },
    });
  }),
);

router.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    const { status = 'all', date } = req.query;
    const filter = {};

    if (!ALLOWED_STATUSES.includes(String(status))) {
      throw httpError(400, 'Invalid booking status filter.');
    }
    if (status !== 'all') filter.status = status;
    if (date) {
      if (!isValidDateString(String(date))) throw httpError(400, 'Invalid date filter.');
      filter.date = String(date);
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('court', 'name sport location image')
      .sort({ date: 1, startTime: 1 })
      .limit(250)
      .lean();

    res.json({ count: bookings.length, bookings });
  }),
);

router.get(
  '/courts',
  asyncHandler(async (_req, res) => {
    const courts = await Court.find().sort({ active: -1, featured: -1, name: 1 }).lean();
    res.json({ count: courts.length, courts });
  }),
);

function courtPayload(body) {
  const name = String(body.name || '').trim();
  const sport = String(body.sport || '').trim();
  const surface = String(body.surface || '').trim();
  const location = String(body.location || '').trim();
  const openTime = String(body.openTime || '').trim();
  const closeTime = String(body.closeTime || '').trim();
  const pricePerHour = Number(body.pricePerHour);
  const capacity = Number(body.capacity || 10);
  const rating = Number(body.rating || 4.8);

  if (!name) throw httpError(400, 'Venue name is required.');
  if (!Court.SPORTS.includes(sport)) throw httpError(400, 'Please choose a supported sport.');
  if (!surface) throw httpError(400, 'Surface is required.');
  if (!location) throw httpError(400, 'Location is required.');
  if (!isValidTimeString(openTime) || !isValidTimeString(closeTime)) {
    throw httpError(400, 'Opening and closing times must use HH:MM format.');
  }
  if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
    throw httpError(400, 'Closing time must be after opening time.');
  }
  if (!Number.isFinite(pricePerHour) || pricePerHour < 0) {
    throw httpError(400, 'Please enter a valid hourly price.');
  }
  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 100) {
    throw httpError(400, 'Capacity must be between 1 and 100.');
  }
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw httpError(400, 'Rating must be between 0 and 5.');
  }

  let amenities = body.amenities;
  if (typeof amenities === 'string') {
    amenities = amenities.split(',');
  }
  if (!Array.isArray(amenities)) amenities = [];

  return {
    name,
    sport,
    surface,
    location,
    description: String(body.description || '').trim().slice(0, 800),
    pricePerHour,
    capacity,
    openTime,
    closeTime,
    image: String(body.image || '').trim(),
    amenities: amenities.map((item) => String(item).trim()).filter(Boolean).slice(0, 20),
    rating: Math.round(rating * 10) / 10,
    reviewsCount: Math.max(0, Number(body.reviewsCount) || 0),
    featured: Boolean(body.featured),
    active: body.active === undefined ? true : Boolean(body.active),
  };
}

router.post(
  '/courts',
  asyncHandler(async (req, res) => {
    const court = await Court.create(courtPayload(req.body || {}));
    res.status(201).json({ message: 'Venue added.', court });
  }),
);

router.put(
  '/courts/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Venue not found.');
    const court = await Court.findById(req.params.id);
    if (!court) throw httpError(404, 'Venue not found.');

    Object.assign(court, courtPayload(req.body || {}));
    await court.save();
    res.json({ message: 'Venue updated.', court });
  }),
);

router.delete(
  '/courts/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Venue not found.');

    const hasBookings = await Booking.exists({ court: req.params.id, status: 'confirmed' });
    if (hasBookings) {
      throw httpError(
        409,
        'This venue has bookings and cannot be deleted. Turn off “Active” to hide it instead.',
      );
    }

    const court = await Court.findByIdAndDelete(req.params.id);
    if (!court) throw httpError(404, 'Venue not found.');
    res.json({ message: 'Venue deleted.' });
  }),
);

module.exports = router;
