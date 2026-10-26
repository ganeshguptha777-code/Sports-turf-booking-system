import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Edit3,
  LayoutDashboard,
  MapPin,
  Plus,
  RefreshCw,
  SearchX,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from '../api';
import Modal from '../components/Modal';
import { InlineLoader, PageLoader } from '../components/Loader';
import { useToast } from '../context/ToastContext';
import {
  bookingReference,
  formatCurrency,
  formatDate,
  formatDayName,
  formatTime,
} from '../utils/format';
import { SPORTS, sportsImage } from '../utils/sports';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'venues', label: 'Venues', icon: MapPin },
];

const EMPTY_COURT = {
  name: '',
  sport: 'Football',
  surface: '',
  location: '',
  description: '',
  pricePerHour: 1200,
  capacity: 10,
  openTime: '06:00',
  closeTime: '22:00',
  image: '',
  amenities: 'Floodlights, Parking, Drinking water',
  rating: 4.8,
  reviewsCount: 0,
  featured: false,
  active: true,
};

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status === 'confirmed' ? 'status-badge--confirmed' : 'status-badge--muted'}`}>
      {status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
    </span>
  );
}

function CourtForm({ court, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(court?._id);
  const [form, setForm] = useState(() =>
    court
      ? {
          ...EMPTY_COURT,
          ...court,
          amenities: Array.isArray(court.amenities) ? court.amenities.join(', ') : '',
        }
      : { ...EMPTY_COURT },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        pricePerHour: Number(form.pricePerHour),
        capacity: Number(form.capacity),
        rating: Number(form.rating),
        reviewsCount: Number(form.reviewsCount),
      };
      const data = await api(editing ? `/admin/courts/${court._id}` : '/admin/courts', {
        method: editing ? 'PUT' : 'POST',
        body: payload,
      });
      toast.success(editing ? 'Venue updated.' : 'Venue added.');
      onSaved(data.court);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const preview = form.image || sportsImage(form.sport);

  return (
    <Modal title={editing ? 'Edit venue' : 'Add a venue'} onClose={() => !saving && onClose()} wide>
      <form className="court-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert">{error}</div>}

        <div className="court-form__layout">
          <div className="court-form__fields">
            <div className="form-row">
              <label className="form-field">
                <span>Venue name</span>
                <input type="text" value={form.name} onChange={update('name')} placeholder="The Green Room" required />
              </label>
              <label className="form-field">
                <span>Sport</span>
                <select value={form.sport} onChange={update('sport')}>
                  {SPORTS.map((sport) => (
                    <option key={sport.name} value={sport.name}>{sport.label}</option>
                  ))}
                  <option value="Pickleball">Pickleball</option>
                  <option value="Padel">Padel</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Surface</span>
                <input
                  type="text"
                  value={form.surface}
                  onChange={update('surface')}
                  placeholder="FIFA-grade artificial grass"
                  required
                />
              </label>
              <label className="form-field">
                <span>Location</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={update('location')}
                  placeholder="Koramangala, Bengaluru"
                  required
                />
              </label>
            </div>

            <label className="form-field">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={update('description')}
                placeholder="What makes this venue worth playing at?"
                maxLength={800}
              />
            </label>

            <div className="form-row form-row--three">
              <label className="form-field">
                <span>Price / hour (₹)</span>
                <input type="number" min="0" value={form.pricePerHour} onChange={update('pricePerHour')} required />
              </label>
              <label className="form-field">
                <span>Capacity</span>
                <input type="number" min="1" max="100" value={form.capacity} onChange={update('capacity')} required />
              </label>
              <label className="form-field">
                <span>Rating</span>
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={update('rating')} />
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Opens</span>
                <input type="time" value={form.openTime} onChange={update('openTime')} required />
              </label>
              <label className="form-field">
                <span>Closes</span>
                <input type="time" value={form.closeTime} onChange={update('closeTime')} required />
              </label>
            </div>

            <label className="form-field">
              <span>Amenities <small>(comma separated)</small></span>
              <input type="text" value={form.amenities} onChange={update('amenities')} placeholder="Floodlights, Parking, Showers" />
            </label>

            <label className="form-field">
              <span>Cover image URL <small>(optional)</small></span>
              <input type="url" value={form.image} onChange={update('image')} placeholder="https://images.unsplash.com/…" />
            </label>

            <div className="court-form__toggles">
              <label className="toggle-row">
                <input type="checkbox" checked={form.featured} onChange={update('featured')} />
                <span><Check size={14} /></span>
                Feature on homepage
              </label>
              <label className="toggle-row">
                <input type="checkbox" checked={form.active} onChange={update('active')} />
                <span><Check size={14} /></span>
                Active and bookable
              </label>
            </div>
          </div>

          <aside className="court-form__preview">
            <span>Live preview</span>
            <div className="preview-card">
              <img
                src={preview}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/court-placeholder.svg';
                }}
              />
              <div className="preview-card__body">
                <span className="pill pill--soft">{form.sport}</span>
                <h4>{form.name || 'Your new venue'}</h4>
                <p><MapPin size={13} /> {form.location || 'Location'}</p>
                <strong>{formatCurrency(form.pricePerHour)} <small>/ hour</small></strong>
              </div>
            </div>
            <p className="court-form__hint">
              Tip: use a landscape image at least 1200px wide. Empty images fall back to a sport-themed cover.
            </p>
          </aside>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? <InlineLoader label="Saving…" /> : editing ? 'Save changes' : 'Add venue'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [bookingCancelTarget, setBookingCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [courtModal, setCourtModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const data = await api('/admin/stats');
      setStats(data.stats);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadCourts() {
    setCourtsLoading(true);
    try {
      const data = await api('/admin/courts');
      setCourts(data.courts || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCourtsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    loadCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFilter) params.set('date', dateFilter);

    setBookingsLoading(true);
    api(`/admin/bookings?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setBookings(data.bookings || []);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error.message);
      })
      .finally(() => {
        if (!cancelled) setBookingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter]);

  const chartMax = useMemo(
    () => Math.max(1, ...(stats?.weekly || []).map((day) => day.bookings)),
    [stats],
  );

  async function handleCancelBooking() {
    if (!bookingCancelTarget) return;
    setCancelling(true);
    try {
      const data = await api(`/bookings/${bookingCancelTarget._id}/cancel`, { method: 'PATCH' });
      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingCancelTarget._id ? { ...booking, ...data.booking } : booking,
        ),
      );
      setBookingCancelTarget(null);
      toast.success('Booking cancelled.');
      loadStats();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancelling(false);
    }
  }

  async function handleDeleteCourt() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/admin/courts/${deleteTarget._id}`, { method: 'DELETE' });
      setCourts((current) => current.filter((court) => court._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success('Venue deleted.');
      loadStats();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleCourtSaved(savedCourt) {
    setCourts((current) => {
      const exists = current.some((court) => court._id === savedCourt._id);
      if (exists) {
        return current.map((court) => (court._id === savedCourt._id ? savedCourt : court));
      }
      return [savedCourt, ...current];
    });
    loadStats();
  }

  if (statsLoading && !stats) {
    return (
      <div className="details-loader">
        <PageLoader label="Opening the control room…" />
      </div>
    );
  }

  return (
    <>
      <section className="admin-header">
        <div className="container admin-header__inner">
          <div>
            <span className="eyebrow eyebrow--light">Operations · TurfBook</span>
            <h1>Run the courts.</h1>
            <p>Keep an eye on bookings, revenue and venue availability — all from one place.</p>
          </div>
          <div className="admin-header__actions">
            <button type="button" className="btn btn--outline-light btn--sm" onClick={() => { loadStats(); loadCourts(); }}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button type="button" className="btn btn--accent btn--sm" onClick={() => setCourtModal({ court: null })}>
              <Plus size={16} /> Add venue
            </button>
          </div>
        </div>
      </section>

      <section className="admin-page">
        <div className="container">
          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            {TABS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={tab === item.id ? 'is-active' : ''}
                  onClick={() => setTab(item.id)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {tab === 'overview' && (
            <div className="admin-panel">
              <div className="stat-grid">
                <article className="stat-card stat-card--dark">
                  <div className="stat-card__top">
                    <span>Total bookings</span>
                    <span className="stat-card__icon"><CalendarDays size={19} /></span>
                  </div>
                  <strong>{stats?.totalBookings ?? 0}</strong>
                  <p><TrendingUp size={14} /> {stats?.todaysBookings ?? 0} scheduled today</p>
                </article>
                <article className="stat-card">
                  <div className="stat-card__top">
                    <span>Confirmed revenue</span>
                    <span className="stat-card__icon"><CircleDollarSign size={19} /></span>
                  </div>
                  <strong>{formatCurrency(stats?.totalRevenue ?? 0)}</strong>
                  <p>Collected at the venue</p>
                </article>
                <article className="stat-card">
                  <div className="stat-card__top">
                    <span>Active venues</span>
                    <span className="stat-card__icon"><MapPin size={19} /></span>
                  </div>
                  <strong>{stats?.activeCourts ?? 0}</strong>
                  <p><Link to="/courts">View public listing <ArrowRight size={13} /></Link></p>
                </article>
                <article className="stat-card">
                  <div className="stat-card__top">
                    <span>Players</span>
                    <span className="stat-card__icon"><Users size={19} /></span>
                  </div>
                  <strong>{stats?.totalUsers ?? 0}</strong>
                  <p>Registered accounts</p>
                </article>
              </div>

              <div className="admin-grid">
                <article className="admin-card chart-card">
                  <div className="admin-card__head">
                    <div>
                      <span className="eyebrow">Last 7 days</span>
                      <h2>Booking pulse</h2>
                    </div>
                    <span className="tiny-badge"><BarChart3 size={13} /> Bookings created</span>
                  </div>
                  <div className="bar-chart">
                    {(stats?.weekly || []).map((day) => (
                      <div className="bar-chart__item" key={day.date}>
                        <div className="bar-chart__track">
                          <span
                            className="bar-chart__bar"
                            style={{ height: `${Math.max(day.bookings ? 12 : 3, (day.bookings / chartMax) * 100)}%` }}
                            title={`${day.bookings} bookings on ${formatDate(day.date)}`}
                          >
                            <i>{day.bookings}</i>
                          </span>
                        </div>
                        <span>{formatDayName(day.date)}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="admin-card">
                  <div className="admin-card__head">
                    <div>
                      <span className="eyebrow">Most booked</span>
                      <h2>Top venues</h2>
                    </div>
                  </div>
                  <div className="top-venues">
                    {(stats?.topCourts || []).length ? (
                      stats.topCourts.map((court) => (
                        <div className="top-venue" key={String(court.courtId)}>
                          <div className="top-venue__head">
                            <strong>{court.name}</strong>
                            <span>{court.bookings} bookings</span>
                          </div>
                          <div className="top-venue__track">
                            <span
                              style={{
                                width: `${Math.max(8, (court.bookings / Math.max(1, stats.topCourts[0]?.bookings || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <small>{court.sport} · {formatCurrency(court.revenue)}</small>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty-copy">No booking data yet.</p>
                    )}
                  </div>
                </article>
              </div>

              <article className="admin-card">
                <div className="admin-card__head">
                  <div>
                    <span className="eyebrow">Latest activity</span>
                    <h2>Recent bookings</h2>
                  </div>
                  <button type="button" className="text-link" onClick={() => setTab('bookings')}>
                    All bookings <ChevronRight size={16} />
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Venue</th>
                        <th>Slot</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentBookings || []).map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <strong>{booking.user?.name || '—'}</strong>
                            <span>{booking.user?.email}</span>
                          </td>
                          <td>
                            <strong>{booking.court?.name || '—'}</strong>
                            <span>{booking.court?.sport}</span>
                          </td>
                          <td>
                            <strong>{formatDate(booking.date)}</strong>
                            <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                          </td>
                          <td><strong>{formatCurrency(booking.amount)}</strong></td>
                          <td><StatusBadge status={booking.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="admin-panel">
              <article className="admin-card">
                <div className="admin-card__head admin-card__head--filter">
                  <div>
                    <span className="eyebrow">All reservations</span>
                    <h2>Bookings</h2>
                  </div>
                  <div className="admin-filters">
                    <label>
                      <span>Status</span>
                      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>
                    <label>
                      <span>Date</span>
                      <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
                    </label>
                    {(statusFilter !== 'all' || dateFilter) && (
                      <button
                        type="button"
                        className="clear-filters"
                        onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
                      >
                        <XCircle size={15} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-wrap">
                  {bookingsLoading ? (
                    <div className="table-loader"><InlineLoader label="Loading bookings…" /></div>
                  ) : (
                    <table className="data-table data-table--bookings">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Venue</th>
                          <th>Date & time</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Ref</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking._id}>
                            <td>
                              <strong>{booking.user?.name || '—'}</strong>
                              <span>{booking.user?.email}</span>
                            </td>
                            <td>
                              <strong>{booking.court?.name || '—'}</strong>
                              <span>{booking.court?.location}</span>
                            </td>
                            <td>
                              <strong>{formatDate(booking.date)}</strong>
                              <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            </td>
                            <td><strong>{formatCurrency(booking.amount)}</strong></td>
                            <td><StatusBadge status={booking.status} /></td>
                            <td><span className="ref-code">TB-{bookingReference(booking._id)}</span></td>
                            <td>
                              {booking.status === 'confirmed' && (
                                <button
                                  type="button"
                                  className="table-action table-action--danger"
                                  onClick={() => setBookingCancelTarget(booking)}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {!bookingsLoading && bookings.length === 0 && (
                    <div className="admin-empty">
                      <SearchX size={24} />
                      <p>No bookings match these filters.</p>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </div>
          )}

          {tab === 'venues' && (
            <div className="admin-panel">
              <div className="admin-section-head">
                <div>
                  <span className="eyebrow">Your roster</span>
                  <h2>Venues <span>{courts.length}</span></h2>
                </div>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setCourtModal({ court: null })}>
                  <Plus size={16} /> Add venue
                </button>
              </div>

              {courtsLoading ? (
                <div className="table-loader"><InlineLoader label="Loading venues…" /></div>
              ) : courts.length ? (
                <div className="admin-venue-grid">
                  {courts.map((court) => (
                    <article className={`admin-venue ${!court.active ? 'is-inactive' : ''}`} key={court._id}>
                      <div className="admin-venue__image">
                        <img
                          src={court.image || sportsImage(court.sport)}
                          alt=""
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = '/court-placeholder.svg';
                          }}
                        />
                        <span className={`status-dot ${court.active ? 'is-live' : ''}`}>
                          {court.active ? 'Live' : 'Hidden'}
                        </span>
                        {court.featured && <span className="admin-venue__featured">Featured</span>}
                      </div>
                      <div className="admin-venue__body">
                        <span className="pill pill--soft">{court.sport}</span>
                        <h3>{court.name}</h3>
                        <p><MapPin size={14} /> {court.location}</p>
                        <div className="admin-venue__facts">
                          <span><CircleDollarSign size={14} /> {formatCurrency(court.pricePerHour)}/hr</span>
                          <span><Clock3 size={14} /> {formatTime(court.openTime)} – {formatTime(court.closeTime)}</span>
                        </div>
                        <div className="admin-venue__actions">
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCourtModal({ court })}>
                            <Edit3 size={15} /> Edit
                          </button>
                          <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(court)} aria-label={`Delete ${court.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-state__icon"><MapPin size={26} /></span>
                  <h2>No venues yet.</h2>
                  <p>Add your first turf or court to start taking bookings.</p>
                  <button type="button" className="btn btn--primary" onClick={() => setCourtModal({ court: null })}>
                    Add a venue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {courtModal && (
        <CourtForm
          court={courtModal.court}
          onClose={() => setCourtModal(null)}
          onSaved={handleCourtSaved}
        />
      )}

      {bookingCancelTarget && (
        <Modal title="Cancel this booking?" onClose={() => !cancelling && setBookingCancelTarget(null)}>
          <div className="cancel-modal">
            <span className="cancel-modal__icon"><XCircle size={28} /></span>
            <p>
              Cancel <strong>{bookingCancelTarget.user?.name}</strong>’s booking at{' '}
              <strong>{bookingCancelTarget.court?.name}</strong>?
            </p>
            <div className="cancel-modal__summary">
              <span>{formatDate(bookingCancelTarget.date)}</span>
              <strong>{formatTime(bookingCancelTarget.startTime)} – {formatTime(bookingCancelTarget.endTime)}</strong>
            </div>
            <p className="cancel-modal__note">The slot will be released immediately. This can’t be undone.</p>
            <div className="cancel-modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setBookingCancelTarget(null)} disabled={cancelling}>
                Keep booking
              </button>
              <button type="button" className="btn btn--danger" onClick={handleCancelBooking} disabled={cancelling}>
                {cancelling ? <InlineLoader label="Cancelling…" /> : 'Cancel booking'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete this venue?" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="cancel-modal">
            <span className="cancel-modal__icon"><Trash2 size={28} /></span>
            <p>Delete <strong>{deleteTarget.name}</strong> permanently?</p>
            <p className="cancel-modal__note">
              Venues with confirmed bookings can’t be deleted. If this one has bookings, turn off
              “Active and bookable” when editing instead.
            </p>
            <div className="cancel-modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Keep venue
              </button>
              <button type="button" className="btn btn--danger" onClick={handleDeleteCourt} disabled={deleting}>
                {deleting ? <InlineLoader label="Deleting…" /> : 'Delete venue'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
