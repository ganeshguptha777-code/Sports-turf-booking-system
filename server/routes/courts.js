const express = require('express');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const { asyncHandler, httpError } = require('../utils/http');
const { buildSlots, validateBookingDate, getZonedNow } = require('../utils/time');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SORTS = {
  recommended: { featured: -1, rating: -1, createdAt: -1 },
  rating: { rating: -1, reviewsCount: -1 },
  price_asc: { pricePerHour: 1 },
  price_desc: { pricePerHour: -1 },
  name: { name: 1 },
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { sport, search, featured, sort } = req.query;
    const limit = Math.min(Number(req.query.limit) || 60, 60);
    const filter = { active: true };

    if (sport && String(sport).toLowerCase() !== 'all') {
      filter.sport = String(sport);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search) {
      const pattern = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: pattern }, { location: pattern }, { surface: pattern }, { sport: pattern }];
    }

    const courts = await Court.find(filter)
      .sort(SORTS[sort] || SORTS.recommended)
      .limit(limit)
      .lean();

    res.json({ count: courts.length, courts });
  }),
);

router.get(
  '/:id/availability',
  asyncHandler(async (req, res) => {
    const date = String(req.query.date || getZonedNow().date);
    const dateError = validateBookingDate(date);
    if (dateError) throw httpError(400, dateError);

    const court = await Court.findOne({ _id: req.params.id, active: true }).lean();
    if (!court) throw httpError(404, 'That venue could not be found.');

    const bookings = await Booking.find({
      court: court._id,
      date,
      status: 'confirmed',
    })
      .select('startTime -_id')
      .lean();

    const slots = buildSlots(
      court,
      bookings.map((booking) => booking.startTime),
      date,
    );

    res.json({
      date,
      timezone: getZonedNow().timezone,
      court: {
        _id: court._id,
        name: court.name,
        sport: court.sport,
        openTime: court.openTime,
        closeTime: court.closeTime,
        pricePerHour: court.pricePerHour,
      },
      slots,
    });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const court = await Court.findOne({ _id: req.params.id, active: true }).lean();
    if (!court) throw httpError(404, 'That venue could not be found.');

    res.json({ court });
  }),
);

module.exports = router;
