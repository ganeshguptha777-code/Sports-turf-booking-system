export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function todayYMD() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysYMD(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(parseLocalDate(dateString));
}

export function formatDateShort(dateString) {
  return formatDate(dateString, { year: undefined });
}

export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDayName(dateString) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(parseLocalDate(dateString));
}

export function formatDayNumber(dateString) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(parseLocalDate(dateString));
}

export function relativeDayLabel(dateString) {
  const today = todayYMD();
  if (dateString === today) return 'Today';
  if (dateString === addDaysYMD(today, 1)) return 'Tomorrow';
  return formatDateShort(dateString);
}

export function isUpcomingBooking(booking) {
  if (booking.status !== 'confirmed') return false;
  const stamp = `${booking.date}T${booking.startTime}:00`;
  return new Date(stamp).getTime() >= Date.now();
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function bookingReference(id = '') {
  return String(id).slice(-6).toUpperCase();
}
