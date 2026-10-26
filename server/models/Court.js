const mongoose = require('mongoose');

const SPORTS = ['Football', 'Tennis', 'Basketball', 'Badminton', 'Cricket', 'Pickleball', 'Padel'];

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required.'],
      trim: true,
      maxlength: [80, 'Venue name cannot exceed 80 characters.'],
    },
    sport: {
      type: String,
      required: [true, 'Sport is required.'],
      enum: {
        values: SPORTS,
        message: 'Please select a supported sport.',
      },
    },
    surface: {
      type: String,
      required: [true, 'Surface is required.'],
      trim: true,
      maxlength: [60, 'Surface cannot exceed 60 characters.'],
    },
    location: {
      type: String,
      required: [true, 'Location is required.'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [800, 'Description cannot exceed 800 characters.'],
      default: '',
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
      max: [100000, 'Price seems too high.'],
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1.'],
      max: [100, 'Capacity cannot exceed 100.'],
      default: 10,
    },
    openTime: {
      type: String,
      required: [true, 'Opening time is required.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Opening time must be in HH:MM format.'],
      default: '06:00',
    },
    closeTime: {
      type: String,
      required: [true, 'Closing time is required.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Closing time must be in HH:MM format.'],
      default: '22:00',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative.'],
      max: [5, 'Rating cannot exceed 5.'],
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

courtSchema.index({ sport: 1, active: 1 });
courtSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Court', courtSchema);
module.exports.SPORTS = SPORTS;
