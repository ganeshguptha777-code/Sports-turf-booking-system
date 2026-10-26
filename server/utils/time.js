const TIMEZONE = () => process.env.TIMEZONE || 'Asia/Kolkata';

/**
 * Returns the current date/time in the configured venue timezone.
 * Using the venue timezone (instead of the server timezone) prevents
 * Render's UTC clock from marking today's evening slots as "past".
 */
function getZonedNow() {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  let hour = String(parts.hour || '00');
  // Some ICU versions return "24" at midnight.
  if (hour === '24') hour = '00';

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
    timezone: TIMEZONE(),
  };
}

function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTimeString(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function dayDifference(fromDate, toDate) {
  const start = Date.parse(`${fromDate}T00:00:00Z`);
  const end = Date.parse(`${toDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function isPastSlot(date, startTime) {
  const now = getZonedNow();
  return date < now.date || (date === now.date && startTime <= now.time);
}

function buildSlots(court, bookedTimes = [], date) {
  const open = timeToMinutes(court.openTime);
  const close = timeToMinutes(court.closeTime);
  const booked = new Set(bookedTimes);
  const slots = [];

  for (let start = open; start + 60 <= close; start += 60) {
    const startTime = minutesToTime(start);
    const past = isPastSlot(date, startTime);
    const isBooked = booked.has(startTime);

    slots.push({
      startTime,
      endTime: minutesToTime(start + 60),
      available: !past && !isBooked,
      reason: past ? 'past' : isBooked ? 'booked' : null,
      price: court.pricePerHour,
    });
  }

  return slots;
}

function validateBookingDate(date) {
  if (!isValidDateString(date)) {
    return 'Please choose a valid date.';
  }

  const now = getZonedNow();
  const difference = dayDifference(now.date, date);

  if (difference < 0) return 'You cannot book a date in the past.';
  if (difference > 60) return 'Bookings open up to 60 days in advance.';
  return null;
}

module.exports = {
  TIMEZONE,
  getZonedNow,
  isValidDateString,
  isValidTimeString,
  addDays,
  dayDifference,
  timeToMinutes,
  minutesToTime,
  isPastSlot,
  buildSlots,
  validateBookingDate,
};
