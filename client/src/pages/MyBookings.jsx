import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  Ticket,
  Trophy,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import Modal from '../components/Modal';
import { InlineLoader, PageLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  bookingReference,
  formatCurrency,
  formatDate,
  formatTime,
  isUpcomingBooking,
  parseLocalDate,
} from '../utils/format';
import { sportsImage } from '../utils/sports';

function BookingCard({ booking, onCancel, cancelling }) {
  const upcoming = isUpcomingBooking(booking);
  const image = booking.court?.image || sportsImage(booking.court?.sport);
  const date = parseLocalDate(booking.date);
  const month = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date);

  return (
    <article className="booking-row">
      <div className="booking-row__date">
        <span>{month}</span>
        <strong>{date.getDate()}</strong>
      </div>

      <div className="booking-row__image">
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/court-placeholder.svg';
          }}
        />
      </div>

      <div className="booking-row__info">
        <div className="booking-row__title">
          <span className="pill pill--soft">{booking.court?.sport || 'Sport'}</span>
          <h3>{booking.court?.name || 'Venue unavailable'}</h3>
        </div>
        <div className="booking-row__meta">
          <span><CalendarDays size={14} /> {formatDate(booking.date)}</span>
          <span><Clock3 size={14} /> {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
          <span><MapPin size={14} /> {booking.court?.location || 'Venue location'}</span>
        </div>
        <p className="booking-row__ref">Ref TB-{bookingReference(booking._id)}</p>
      </div>

      <div className="booking-row__side">
        <span
          className={`status-badge ${
            booking.status === 'cancelled'
              ? 'status-badge--muted'
              : upcoming
                ? 'status-badge--confirmed'
                : 'status-badge--past'
          }`}
        >
          {booking.status === 'cancelled' ? 'Cancelled' : upcoming ? 'Confirmed' : 'Played'}
        </span>
        <strong className="booking-row__amount">{formatCurrency(booking.amount)}</strong>
        {upcoming && (
          <button
            type="button"
            className="booking-row__cancel"
            onClick={() => onCancel(booking)}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api('/bookings/mine')
      .then((data) => {
        if (!cancelled) {
          setBookings(data.bookings || []);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, history } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const left = `${a.date}T${a.startTime}`;
      const right = `${b.date}T${b.startTime}`;
      return right.localeCompare(left);
    });
    return {
      upcoming: sorted.filter(isUpcomingBooking).sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)),
      history: sorted.filter((booking) => !isUpcomingBooking(booking)),
    };
  }, [bookings]);

  const list = tab === 'upcoming' ? upcoming : history;
  const nextGame = upcoming[0];
  const upcomingSpend = upcoming.reduce((total, booking) => total + booking.amount, 0);
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const data = await api(`/bookings/${cancelTarget._id}/cancel`, { method: 'PATCH' });
      setBookings((current) =>
        current.map((booking) => (booking._id === cancelTarget._id ? data.booking : booking)),
      );
      setCancelTarget(null);
      toast.success('Booking cancelled. The slot is now open for other players.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="details-loader">
        <PageLoader label="Pulling up your bookings…" />
      </div>
    );
  }

  return (
    <>
      <section className="account-header">
        <div className="container account-header__inner">
          <div>
            <span className="eyebrow"><Ticket size={14} /> Your court-side pass</span>
            <h1>Your game plan.</h1>
            <p>Every slot you’ve booked, all in one place. Cancel before the start time if plans change.</p>
          </div>
          <div className="account-header__player">
            <span className="account-header__trophy"><Trophy size={22} /></span>
            <div>
              <strong>{user?.name}</strong>
              <span>{confirmedCount} confirmed booking{confirmedCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bookings-page section">
        <div className="container">
          {error && <div className="inline-alert">{error}</div>}

          <div className="booking-overview">
            <article className="next-game">
              <div className="next-game__glow" aria-hidden="true" />
              <span className="eyebrow eyebrow--light">Your next game</span>
              {nextGame ? (
                <>
                  <h2>{nextGame.court?.name}</h2>
                  <p className="next-game__when">
                    {formatDate(nextGame.date)} · {formatTime(nextGame.startTime)} – {formatTime(nextGame.endTime)}
                  </p>
                  <p className="next-game__where"><MapPin size={15} /> {nextGame.court?.location}</p>
                  <div className="next-game__footer">
                    <span className="status-badge status-badge--confirmed">Confirmed</span>
                    <span className="next-game__ref">TB-{bookingReference(nextGame._id)}</span>
                  </div>
                </>
              ) : (
                <>
                  <h2>No game on the books.</h2>
                  <p className="next-game__when">The calendar is wide open. Let’s fix that.</p>
                  <Link to="/courts" className="btn btn--accent btn--sm">
                    Find a court <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </article>

            <div className="booking-stats">
              <article>
                <span>Upcoming</span>
                <strong>{upcoming.length}</strong>
                <small>confirmed slot{upcoming.length === 1 ? '' : 's'}</small>
              </article>
              <article>
                <span>Upcoming total</span>
                <strong>{formatCurrency(upcomingSpend)}</strong>
                <small>payable at venue</small>
              </article>
              <article>
                <span>Games played</span>
                <strong>{bookings.filter((item) => item.status === 'confirmed' && !isUpcomingBooking(item)).length}</strong>
                <small>nice work</small>
              </article>
            </div>
          </div>

          <div className="bookings-toolbar">
            <div className="tabs" role="tablist" aria-label="Booking filters">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'upcoming'}
                className={tab === 'upcoming' ? 'is-active' : ''}
                onClick={() => setTab('upcoming')}
              >
                Upcoming <span>{upcoming.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'history'}
                className={tab === 'history' ? 'is-active' : ''}
                onClick={() => setTab('history')}
              >
                History <span>{history.length}</span>
              </button>
            </div>
            <Link to="/courts" className="btn btn--primary btn--sm">Book another slot</Link>
          </div>

          {list.length > 0 ? (
            <div className="booking-list">
              {list.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={setCancelTarget}
                  cancelling={cancelling && cancelTarget?._id === booking._id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon">
                {tab === 'upcoming' ? <CalendarDays size={27} /> : <XCircle size={27} />}
              </span>
              <h2>{tab === 'upcoming' ? 'Nothing on the schedule.' : 'No games in the history books yet.'}</h2>
              <p>
                {tab === 'upcoming'
                  ? 'Pick a venue and lock in your next hour on court.'
                  : 'Once you’ve played, your past bookings will show up here.'}
              </p>
              {tab === 'upcoming' && (
                <Link to="/courts" className="btn btn--primary">
                  Find a court <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}

          <div className="booking-help">
            <div>
              <CreditCard size={19} />
              <p><strong>Pay at the venue.</strong> Bring your booking reference; settle the amount at the front desk.</p>
            </div>
            <div>
              <Clock3 size={19} />
              <p><strong>Running late?</strong> Your slot still ends on time. Call the venue directly if you need help.</p>
            </div>
          </div>
        </div>
      </section>

      {cancelTarget && (
        <Modal title="Cancel this booking?" onClose={() => !cancelling && setCancelTarget(null)}>
          <div className="cancel-modal">
            <span className="cancel-modal__icon"><XCircle size={28} /></span>
            <p>This will release your slot at <strong>{cancelTarget.court?.name}</strong>.</p>
            <div className="cancel-modal__summary">
              <span>{formatDate(cancelTarget.date)}</span>
              <strong>{formatTime(cancelTarget.startTime)} – {formatTime(cancelTarget.endTime)}</strong>
            </div>
            <p className="cancel-modal__note">The slot becomes available to other players immediately. This can’t be undone.</p>
            <div className="cancel-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                Keep booking
              </button>
              <button type="button" className="btn btn--danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <InlineLoader label="Cancelling…" /> : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
