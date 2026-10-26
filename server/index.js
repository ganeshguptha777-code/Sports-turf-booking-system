const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');
const { seedDemoData } = require('./seed');
const authRoutes = require('./routes/auth');
const courtRoutes = require('./routes/courts');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

if (process.env.CLIENT_URL) {
  const allowedOrigins = process.env.CLIENT_URL.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowedOrigins }));
} else {
  app.use(cors());
}

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 800,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please slow down and try again shortly.' },
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'turfbook-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', notFound);

const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      message: 'TurfBook API is running. Start the Vite dev server for the frontend.',
      health: '/api/health',
    });
  });
}

app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('[server] JWT_SECRET is required in production. Add it to your environment variables.');
    process.exit(1);
  }

  await connectDB();

  try {
    await seedDemoData();
  } catch (error) {
    console.error('[seed] could not complete demo seed:', error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[api] TurfBook listening on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[api] frontend dev server: http://localhost:5173');
    }
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, closing gracefully…`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('[server] failed to start:', error);
    process.exit(1);
  });
}

module.exports = { app, start };
