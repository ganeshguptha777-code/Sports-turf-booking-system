const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const { protect } = require('../middleware/auth');
const { asyncHandler, httpError } = require('../utils/http');
const {
  buildSlots,
  isPastSlot,
  isValidTimeString,
  validateBookingDate,
} = require('../utils/time');

const router = express.Router();
router.use(protect);

router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('court', 'name sport surface location image openTime closeTime pricePerHour')
      .sort({ date: -1, startTime: -1 })
      .lean();

    res.json({ count: bookings.length, bookings });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { court: courtId, date, startTime, notes } = req.body || {};

    if (!mongoose.isValidObjectId(courtId)) {
      throw httpError(400, 'Please choose a venue.');
    }

    const dateError = validateBookingDate(String(date || ''));
    if (dateError) throw httpError(400, dateError);

    if (!isValidTimeString(String(startTime || ''))) {
      throw httpError(400, 'Please choose a valid start time.');
    }

    const court = await Court.findOne({ _id: courtId, active: true });
    if (!court) throw httpError(404, 'That venue is not available for booking.');

    const slots = buildSlots(court, [], String(date));
    const slot = slots.find((item) => item.startTime === startTime);

    if (!slot) {
      throw httpError(400, 'That time is outside the venue’s opening hours.');
    }

    if (isPastSlot(String(date), String(startTime))) {
      throw httpError(400, 'That time slot has already passed.');
    }

    const existing = await Booking.exists({
      court: court._id,
      date,
      startTime,
      status: 'confirmed',
    });
    if (existing) {
      throw httpError(409, 'That slot was just booked. Please choose another time.');
    }

    const booking = await Booking.create({
      user: req.user._id,
      court: court._id,
      date,
      startTime,
      endTime: slot.endTime,
      durationMinutes: 60,
      amount: court.pricePerHour,
      notes: String(notes || '').trim().slice(0, 300),
      status: 'confirmed',
      paymentStatus: 'pay_at_venue',
    });

    await booking.populate('court', 'name sport surface location image openTime closeTime pricePerHour');

    res.status(201).json({
      message: 'Your court is booked.',
      booking,
    });
  }),
);

router.patch(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate(
      'court',
      'name sport surface location image openTime closeTime pricePerHour',
    );

    if (!booking) throw httpError(404, 'That booking could not be found.');

    const ownsBooking = String(booking.user) === String(req.user._id);
    if (!ownsBooking && req.user.role !== 'admin') {
      throw httpError(403, 'You cannot modify this booking.');
    }

    if (booking.status === 'cancelled') {
      throw httpError(400, 'This booking has already been cancelled.');
    }

    if (req.user.role !== 'admin' && isPastSlot(booking.date, booking.startTime)) {
      throw httpError(400, 'A past booking cannot be cancelled. Please contact the venue.');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;
    await booking.save();

    // Keep the response shape consistent with the admin bookings list so
    // clients can update a row in place without losing player details.
    await booking.populate('user', 'name email phone');

    res.json({
      message: 'Booking cancelled.',
      booking,
    });
  }),
);

module.exports = router;
