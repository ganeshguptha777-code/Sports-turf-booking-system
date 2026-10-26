const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'],
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format.'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format.'],
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pay_at_venue', 'paid', 'refunded'],
      default: 'pay_at_venue',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters.'],
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// A slot can only have one active booking. Cancelled bookings are excluded,
// so a cancelled slot immediately becomes bookable again.
bookingSchema.index(
  { court: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
    name: 'unique_active_slot',
  },
);

bookingSchema.index({ user: 1, date: -1, startTime: -1 });
bookingSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
