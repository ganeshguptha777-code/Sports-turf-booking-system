import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import Modal from '../components/Modal';
import { InlineLoader, PageLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  addDaysYMD,
  bookingReference,
  formatCurrency,
  formatDate,
  formatDayName,
  formatDayNumber,
  formatTime,
  todayYMD,
} from '../utils/format';
import { sportsImage } from '../utils/sports';

export default function CourtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const today = todayYMD();

  const urlDate = searchParams.get('date');
  const maxDate = addDaysYMD(today, 60);
  const initialDate = urlDate && urlDate >= today && urlDate <= maxDate ? urlDate : today;

  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const days = Array.from({ length: 7 }, (_value, index) => {
    const date = addDaysYMD(today, index);
    return {
      date,
      day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : formatDayName(date),
      number: formatDayNumber(date),
    };
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    api(`/courts/${id}`)
      .then((data) => {
        if (!cancelled) setCourt(data.court);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    setAvailabilityLoading(true);
    setBookingError('');

    api(`/courts/${id}/availability?date=${selectedDate}`, { signal: controller.signal })
      .then((data) => {
        setAvailability(data);
        setAvailabilityLoading(false);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setBookingError(error.message);
        setAvailabilityLoading(false);
      });

    return () => controller.abort();
  }, [id, selectedDate, reloadKey]);

  function chooseDate(date) {
    if (date < today || date > maxDate) return;
    setSelectedDate(date);
    setSelectedSlot('');
    const next = new URLSearchParams(searchParams);
    next.set('date', date);
    setSearchParams(next, { replace: true });
  }

  async function handleBook() {
    if (!selectedSlot) {
      toast.info('Choose a time slot first.');
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}?date=${selectedDate}` } });
      return;
    }

    setBooking(true);
    setBookingError('');

    try {
      const data = await api('/bookings', {
        method: 'POST',
        body: {
          court: court._id,
          date: selectedDate,
          startTime: selectedSlot,
        },
      });
      setConfirmed(data.booking);
      setSelectedSlot('');
      setReloadKey((value) => value + 1);
      toast.success('Court booked. See you on the field!');
    } catch (error) {
      setBookingError(error.message);
      toast.error(error.message);
      setReloadKey((value) => value + 1);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="details-loader">
        <PageLoader label="Walking onto the court…" />
      </div>
    );
  }

  if (loadError || !court) {
    return (
      <div className="container">
        <div className="empty-state empty-state--page">
          <span className="empty-state__icon"><XCircle size={28} /></span>
          <h1>Court not found.</h1>
          <p>{loadError || 'This venue may no longer be available.'}</p>
          <Link to="/courts" className="btn btn--primary">Back to all courts</Link>
        </div>
      </div>
    );
  }

  const selectedSlotData = availability?.slots?.find((slot) => slot.startTime === selectedSlot);
  const venueImage = court.image || sportsImage(court.sport);

  return (
    <>
      <section className="court-hero">
        <div className="container">
          <Link to="/courts" className="back-link"><ArrowLeft size={16} /> All courts</Link>
          <div className="court-hero__frame">
            <img
              src={venueImage}
              alt={`${court.name} — ${court.sport} venue`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/court-placeholder.svg';
              }}
            />
            <div className="court-hero__overlay" />
            <div className="court-hero__content">
              <div className="court-hero__badges">
                <span className="pill pill--accent">{court.sport}</span>
                {court.featured && <span className="pill pill--glass"><Sparkles size={13} /> Editor’s pick</span>}
              </div>
              <h1>{court.name}</h1>
              <div className="court-hero__meta">
                <span><MapPin size={16} /> {court.location}</span>
                <span><Star size={16} fill="currentColor" /> {Number(court.rating).toFixed(1)} ({court.reviewsCount} reviews)</span>
                <span><Clock3 size={16} /> {formatTime(court.openTime)} – {formatTime(court.closeTime)}</span>
              </div>
            </div>
            <div className="court-hero__price">
              <span>From</span>
              <strong>{formatCurrency(court.pricePerHour)}</strong>
              <small>per hour</small>
            </div>
          </div>
        </div>
      </section>

      <section className="court-details section">
        <div className="container court-details__grid">
          <div className="court-details__main">
            <div className="detail-block">
              <span className="eyebrow">About the venue</span>
              <h2>Good surface. Good lights. Good game.</h2>
              <p className="detail-description">{court.description}</p>

              <div className="venue-facts">
                <div>
                  <span>Surface</span>
                  <strong>{court.surface}</strong>
                </div>
                <div>
                  <span>Capacity</span>
                  <strong>Up to {court.capacity} players</strong>
                </div>
                <div>
                  <span>Hours</span>
                  <strong>{formatTime(court.openTime)} – {formatTime(court.closeTime)}</strong>
                </div>
                <div>
                  <span>Slot length</span>
                  <strong>60 minutes</strong>
                </div>
              </div>
            </div>

            <div className="detail-block">
              <span className="eyebrow">What’s here</span>
              <h2>Everything for a smoother game.</h2>
              <div className="amenities-grid">
                {court.amenities?.map((amenity) => (
                  <span key={amenity} className="amenity">
                    <span><Check size={14} /></span>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <span className="eyebrow">Getting there</span>
              <h2>{court.location}</h2>
              <div className="location-card">
                <div className="location-card__map" aria-hidden="true">
                  <span className="location-card__road location-card__road--one" />
                  <span className="location-card__road location-card__road--two" />
                  <span className="location-card__road location-card__road--three" />
                  <span className="location-card__pin"><MapPin size={19} /></span>
                  <span className="location-card__label">{court.name}</span>
                </div>
                <div className="location-card__info">
                  <h3>Plan your arrival</h3>
                  <p>
                    Reach the venue 10 minutes before your slot so you can check in,
                    gear up and get moving on time.
                  </p>
                  <p className="location-card__address"><MapPin size={15} /> {court.location}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${court.name}, ${court.location}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Open in Google Maps <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>

            <div className="detail-block detail-block--policy">
              <div className="policy-grid">
                <div>
                  <span className="policy-icon"><CreditCard size={19} /></span>
                  <h3>Pay at the venue</h3>
                  <p>No online payment needed. Settle up at the front desk after check-in.</p>
                </div>
                <div>
                  <span className="policy-icon"><ShieldCheck size={19} /></span>
                  <h3>Easy cancellation</h3>
                  <p>Cancel from your bookings before the slot starts and free it up for someone else.</p>
                </div>
                <div>
                  <span className="policy-icon"><Users size={19} /></span>
                  <h3>Arrive together</h3>
                  <p>Your slot is reserved for the full hour. Please arrive on time to make the most of it.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="booking-panel-wrap" aria-label="Book this court">
            <div className="booking-panel">
              <div className="booking-panel__head">
                <div>
                  <span>Reserve your hour</span>
                  <strong>{formatCurrency(court.pricePerHour)} <small>/ hour</small></strong>
                </div>
                <span className="open-badge"><span /> Open today</span>
              </div>

              <div className="booking-panel__section">
                <div className="booking-panel__label">
                  <span><CalendarDays size={16} /> Choose a day</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    max={maxDate}
                    onChange={(event) => chooseDate(event.target.value)}
                    aria-label="Choose a booking date"
                  />
                </div>

                <div className="day-picker">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      className={`day-pill ${selectedDate === day.date ? 'is-active' : ''}`}
                      onClick={() => chooseDate(day.date)}
                    >
                      <span>{day.day}</span>
                      <strong>{day.number}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-panel__section">
                <div className="booking-panel__label">
                  <span><Clock3 size={16} /> Available times</span>
                  <small>{availability?.timezone?.replace('Asia/', '') || 'IST'}</small>
                </div>

                {availabilityLoading ? (
                  <div className="slot-loader"><InlineLoader label="Checking slots…" /></div>
                ) : availability?.slots?.length ? (
                  <div className="slot-grid">
                    {availability.slots.map((slot) => {
                      const isSelected = selectedSlot === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          className={`slot ${isSelected ? 'is-selected' : ''}`}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.startTime)}
                          aria-pressed={isSelected}
                        >
                          <span>{formatTime(slot.startTime)}</span>
                          <small>
                            {slot.reason === 'booked'
                              ? 'Booked'
                              : slot.reason === 'past'
                                ? 'Past'
                                : isSelected
                                  ? 'Selected'
                                  : 'Available'}
                          </small>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="booking-panel__empty">No slots are available for this day.</p>
                )}

                <div className="slot-legend">
                  <span><i className="slot-dot" /> Available</span>
                  <span><i className="slot-dot slot-dot--selected" /> Selected</span>
                  <span><i className="slot-dot slot-dot--booked" /> Unavailable</span>
                </div>
              </div>

              {bookingError && (
                <div className="inline-alert inline-alert--compact">
                  <Info size={15} /> {bookingError}
                </div>
              )}

              <div className="booking-summary">
                <div>
                  <span>Date</span>
                  <strong>{formatDate(selectedDate)}</strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>
                    {selectedSlotData
                      ? `${formatTime(selectedSlotData.startTime)} – ${formatTime(selectedSlotData.endTime)}`
                      : 'Pick a slot'}
                  </strong>
                </div>
                <div className="booking-summary__total">
                  <span>Total</span>
                  <strong>{formatCurrency(selectedSlotData?.price || court.pricePerHour)}</strong>
                </div>
              </div>

              {user ? (
                <button
                  type="button"
                  className="btn btn--primary btn--block booking-panel__submit"
                  onClick={handleBook}
                  disabled={!selectedSlot || booking}
                >
                  {booking ? <InlineLoader label="Booking…" /> : selectedSlot ? 'Confirm booking' : 'Choose a time slot'}
                  {!booking && selectedSlot && <ArrowRight size={18} />}
                </button>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `${location.pathname}?date=${selectedDate}` }}
                  className="btn btn--primary btn--block booking-panel__submit"
                >
                  Sign in to book <ArrowRight size={18} />
                </Link>
              )}

              <p className="booking-panel__fineprint">
                <ShieldCheck size={14} /> Instant confirmation · Pay at the venue
              </p>
            </div>
          </aside>
        </div>
      </section>

      {confirmed && (
        <Modal title="Game confirmed." onClose={() => setConfirmed(null)}>
          <div className="booking-success">
            <span className="booking-success__check"><Check size={34} /></span>
            <p className="booking-success__eyebrow">You’re on the court</p>
            <h3>{confirmed.court?.name || court.name}</h3>
            <p className="booking-success__when">
              {formatDate(confirmed.date)} · {formatTime(confirmed.startTime)} – {formatTime(confirmed.endTime)}
            </p>

            <div className="booking-success__ref">
              <span>Booking reference</span>
              <strong>TB-{bookingReference(confirmed._id)}</strong>
            </div>

            <p className="booking-success__note">
              Pay {formatCurrency(confirmed.amount)} at the venue. We’ve saved this slot under
              your account.
            </p>

            <div className="booking-success__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmed(null)}>
                Book another slot
              </button>
              <Link to="/bookings" className="btn btn--primary">
                View my bookings <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
