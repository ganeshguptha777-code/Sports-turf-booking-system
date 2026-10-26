import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../api';
import CourtCard from '../components/CourtCard';
import { SkeletonCard } from '../components/Loader';
import { addDaysYMD, todayYMD } from '../utils/format';
import { SPORTS } from '../utils/sports';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Courts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayYMD();
  const sport = searchParams.get('sport') || 'All';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'recommended';
  const date = searchParams.get('date') || today;

  const [searchValue, setSearchValue] = useState(q);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === 'All') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== q) updateParams({ q: searchValue.trim() });
    }, 350);
    return () => clearTimeout(timer);
  }, [q, searchValue, updateParams]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (sport !== 'All') params.set('sport', sport);
    if (q.trim()) params.set('search', q.trim());
    if (sort !== 'recommended') params.set('sort', sort);

    setLoading(true);
    setError('');

    api(`/courts?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        setCourts(data.courts || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [sport, q, sort]);

  const hasFilters = sport !== 'All' || Boolean(q) || sort !== 'recommended' || date !== today;

  return (
    <>
      <section className="page-header">
        <div className="container">
          <div className="page-header__top">
            <div>
              <span className="eyebrow"><MapPin size={14} /> Bengaluru, India</span>
              <h1>Find your <em>game.</em></h1>
              <p>
                Pick a sport, choose a day, and see every open hour. Good surfaces,
                honest availability and zero phone calls.
              </p>
            </div>
            <div className="page-header__stat">
              <span>Open to book</span>
              <strong>Up to 60 days ahead</strong>
              <Link to="/bookings">Already booked? View your slots →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="courts-page">
        <div className="container">
          <div className="filter-panel">
            <div className="filter-panel__row">
              <div className="filter-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search venue, surface or area"
                  aria-label="Search venues"
                />
                {searchValue && (
                  <button type="button" onClick={() => setSearchValue('')} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
              </div>

              <label className="filter-control">
                <CalendarDays size={17} />
                <span>Day</span>
                <input
                  type="date"
                  value={date}
                  min={today}
                  max={addDaysYMD(today, 60)}
                  onChange={(event) => updateParams({ date: event.target.value })}
                />
              </label>

              <label className="filter-control filter-control--sort">
                <SlidersHorizontal size={17} />
                <span>Sort</span>
                <select value={sort} onChange={(event) => updateParams({ sort: event.target.value })}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filter-panel__bottom">
              <div className="chip-row" role="group" aria-label="Filter by sport">
                <button
                  type="button"
                  className={`chip ${sport === 'All' ? 'is-active' : ''}`}
                  onClick={() => updateParams({ sport: null })}
                >
                  All sports
                </button>
                {SPORTS.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className={`chip ${sport === item.name ? 'is-active' : ''}`}
                    onClick={() => updateParams({ sport: item.name })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  className="clear-filters"
                  onClick={() => setSearchParams({}, { replace: true })}
                >
                  <X size={15} /> Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="results-bar">
            <p>
              <strong>{loading ? '…' : courts.length}</strong>{' '}
              {courts.length === 1 ? 'venue' : 'venues'}
              {sport !== 'All' && <> for <strong>{sport}</strong></>}
              {q && <> matching “{q}”</>}
            </p>
            <span className="results-bar__hint">Pay at the venue · Free cancellation</span>
          </div>

          {error && <div className="inline-alert">{error}</div>}

          {loading ? (
            <div className="court-grid">
              {[0, 1, 2, 3, 4, 5].map((item) => <SkeletonCard key={item} />)}
            </div>
          ) : courts.length > 0 ? (
            <div className="court-grid">
              {courts.map((court) => <CourtCard key={court._id} court={court} date={date} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon"><Search size={26} /></span>
              <h2>No courts found for this combo.</h2>
              <p>Try another sport or clear your filters. The right surface is out there.</p>
              <button type="button" className="btn btn--primary" onClick={() => setSearchParams({})}>
                Show all courts
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
