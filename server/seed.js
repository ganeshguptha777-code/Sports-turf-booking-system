const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Court = require('./models/Court');
const Booking = require('./models/Booking');
const { addDays, getZonedNow } = require('./utils/time');

const IMAGES = {
  football:
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1400&q=85',
  tennis:
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=85',
  basketball:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=85',
  badminton:
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=85',
  cricket:
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1400&q=85',
};

const VENUES = [
  {
    name: 'The Green Room',
    sport: 'Football',
    surface: 'FIFA-grade artificial grass',
    location: 'Koramangala, Bengaluru',
    description:
      'A floodlit 7-a-side turf with a true bounce, padded perimeter and a clubhouse that stays open late. Cleats and bibs are available at the counter.',
    pricePerHour: 1400,
    capacity: 14,
    openTime: '06:00',
    closeTime: '23:00',
    image: IMAGES.football,
    amenities: ['Floodlights', 'Parking', 'Changing rooms', 'Drinking water', 'Bibs & balls', 'First aid'],
    rating: 4.9,
    reviewsCount: 284,
    featured: true,
  },
  {
    name: 'Baseline Club',
    sport: 'Tennis',
    surface: 'Cushioned hard court',
    location: 'Indiranagar, Bengaluru',
    description:
      'Two well-kept hard courts with excellent grip and shade for late-afternoon rallies. Racquets can be rented and a coach can be arranged on request.',
    pricePerHour: 900,
    capacity: 4,
    openTime: '06:00',
    closeTime: '22:00',
    image: IMAGES.tennis,
    amenities: ['Floodlights', 'Racquet rental', 'Coaching', 'Seating', 'Drinking water', 'Washrooms'],
    rating: 4.8,
    reviewsCount: 196,
    featured: true,
  },
  {
    name: 'Hoops District',
    sport: 'Basketball',
    surface: 'Acrylic outdoor court',
    location: 'HSR Layout, Bengaluru',
    description:
      'A full-length outdoor court built for pickup games and weekend leagues. Glass backboards, crisp lines and plenty of room around the baseline.',
    pricePerHour: 1100,
    capacity: 10,
    openTime: '06:00',
    closeTime: '23:00',
    image: IMAGES.basketball,
    amenities: ['Floodlights', 'Parking', 'Seating', 'Drinking water', 'Scoreboard', 'Washrooms'],
    rating: 4.7,
    reviewsCount: 143,
    featured: true,
  },
  {
    name: 'Smash House',
    sport: 'Badminton',
    surface: 'Synthetic wooden court',
    location: 'Whitefield, Bengaluru',
    description:
      'Two indoor courts with a consistent wooden surface and zero glare. Ideal for fast doubles, with shuttles and basic gear available at the front desk.',
    pricePerHour: 600,
    capacity: 4,
    openTime: '06:00',
    closeTime: '23:00',
    image: IMAGES.badminton,
    amenities: ['Indoor courts', 'Air cooling', 'Shuttle rental', 'Lockers', 'Drinking water', 'Parking'],
    rating: 4.8,
    reviewsCount: 167,
    featured: false,
  },
  {
    name: 'Cover Drive Arena',
    sport: 'Cricket',
    surface: 'Turf wicket & outfield',
    location: 'Electronic City, Bengaluru',
    description:
      'A compact cricket ground for 16-player weekend games, with a turf wicket, practice nets and a boundary that rewards clean hitting.',
    pricePerHour: 1800,
    capacity: 22,
    openTime: '06:00',
    closeTime: '22:00',
    image: IMAGES.cricket,
    amenities: ['Turf wicket', 'Practice nets', 'Floodlights', 'Pavilion', 'Parking', 'First aid'],
    rating: 4.6,
    reviewsCount: 118,
    featured: false,
  },
  {
    name: 'Turf 91',
    sport: 'Football',
    surface: '5-a-side artificial turf',
    location: 'Jayanagar, Bengaluru',
    description:
      'A neighbourhood 5-a-side ground with a fast surface, high nets and easy evening access. Perfect for a quick game after work.',
    pricePerHour: 1000,
    capacity: 10,
    openTime: '07:00',
    closeTime: '22:00',
    image: IMAGES.football,
    amenities: ['Floodlights', 'Drinking water', 'Changing rooms', 'Bibs & balls', 'Washrooms'],
    rating: 4.7,
    reviewsCount: 92,
    featured: false,
  },
];

async function seedUsers() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@turfbook.in').toLowerCase();
  const demoEmail = (process.env.DEMO_EMAIL || 'demo@turfbook.in').toLowerCase();

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'TurfBook Admin',
      email: adminEmail,
      phone: '+91 98800 11223',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin',
    });
  }

  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Aarav Sharma',
      email: demoEmail,
      phone: '+91 98765 43210',
      password: process.env.DEMO_PASSWORD || 'Demo@1234',
      role: 'user',
    });
  }

  return { admin, demoUser };
}

async function seedBookings(demoUser) {
  const existingBookings = await Booking.countDocuments();
  if (existingBookings > 0) return 0;

  const today = getZonedNow().date;
  const planned = [
    { venue: 'The Green Room', date: addDays(today, 1), startTime: '18:00', status: 'confirmed' },
    { venue: 'Baseline Club', date: addDays(today, 2), startTime: '07:00', status: 'confirmed' },
    { venue: 'Hoops District', date: addDays(today, 3), startTime: '20:00', status: 'confirmed' },
    { venue: 'Smash House', date: addDays(today, -2), startTime: '09:00', status: 'confirmed' },
    {
      venue: 'Cover Drive Arena',
      date: addDays(today, 5),
      startTime: '17:00',
      status: 'cancelled',
    },
  ];

  let created = 0;
  for (const item of planned) {
    const court = await Court.findOne({ name: item.venue });
    if (!court) continue;

    const exists = await Booking.exists({
      court: court._id,
      date: item.date,
      startTime: item.startTime,
    });
    if (exists) continue;

    const endHour = String(Number(item.startTime.slice(0, 2)) + 1).padStart(2, '0');
    await Booking.create({
      user: demoUser._id,
      court: court._id,
      date: item.date,
      startTime: item.startTime,
      endTime: `${endHour}:00`,
      durationMinutes: 60,
      amount: court.pricePerHour,
      status: item.status,
      paymentStatus: item.status === 'cancelled' ? 'refunded' : 'pay_at_venue',
      cancelledAt: item.status === 'cancelled' ? new Date() : null,
      notes: 'Sample booking created by the TurfBook demo seed.',
    });
    created += 1;
  }

  return created;
}

async function seedDemoData({ quiet = false } = {}) {
  if (process.env.SEED_DEMO === 'false') {
    if (!quiet) console.log('[seed] SEED_DEMO=false — skipping demo data.');
    return;
  }

  const { admin, demoUser } = await seedUsers();

  let courtCount = await Court.countDocuments();
  if (courtCount === 0) {
    await Court.insertMany(VENUES);
    courtCount = VENUES.length;
  }

  const bookingCount = await seedBookings(demoUser);

  if (!quiet) {
    console.log(`[seed] ready with ${courtCount} venues and ${bookingCount} new sample booking(s).`);
    console.log(`[seed] admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@1234'}`);
    console.log(`[seed] demo:  ${demoUser.email} / ${process.env.DEMO_PASSWORD || 'Demo@1234'}`);
    console.log('[seed] Change these credentials before opening the app to the public.');
  }
}

async function runSeedCli() {
  try {
    await connectDB();
    await seedDemoData();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[seed] failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  runSeedCli();
}

module.exports = { seedDemoData, VENUES, IMAGES };
