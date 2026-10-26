import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import CourtCard from '../components/CourtCard';
import { SkeletonCard } from '../components/Loader';
import { addDaysYMD, todayYMD } from '../utils/format';
import { SPORTS, SPORT_IMAGES } from '../utils/sports';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=85';

const TESTIMONIALS = [
  {
    quote:
      'Booked a turf for eight people in about forty seconds. Everyone showed up, the lights were on, and we actually played. That is the whole review.',
    name: 'Rohan Mehta',
    detail: 'Weekly football · Koramangala',
    initials: 'RM',
  },
  {
    quote:
      'The availability is accurate, which sounds like a low bar until you have driven across town for a “free” court. TurfBook has never let me down.',
    name: 'Nisha Iyer',
    detail: 'Tennis regular · Indiranagar',
    initials: 'NI',
  },
  {
    quote:
      'We use it for team badminton every Wednesday. Pick a slot, pay at the desk, done. No calls, no screenshots, no group-chat chaos.',
    name: 'Kabir Rao',
    detail: 'Office league · Whitefield',
    initials: 'KR',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const today = todayYMD();
  const [sport, setSport] = useState('Football');
  const [date, setDate] = useState(addDaysYMD(today, 0));
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api('/courts?featured=true&limit=3')
      .then((data) => {
        if (!cancelled) {
          setCourts(data.courts || []);
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

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (date) params.set('date', date);
    navigate(`/courts?${params.toString()}`);
  }

  return (
    <>
      <section className="hero">
        <div className="hero__grain" aria-hidden="true" />
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow eyebrow--light">
              <Sparkles size={14} /> Bengaluru’s home for everyday sport
            </span>

            <h1>
              Book the court.
              <span>Bring the game.</span>
            </h1>

            <p className="hero__lede">
              Real-time availability at the city’s best turfs and courts. Pick your slot,
              get instant confirmation, and pay when you arrive.
            </p>

            <div className="hero__actions">
              <Link to="/courts" className="btn btn--accent">
                Find a court <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn--outline-light">
                How it works
              </a>
            </div>

            <div className="hero__proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>RM</span>
                <span>NI</span>
                <span>KR</span>
                <span>+2k</span>
              </div>
              <div>
                <div className="hero__stars" aria-label="Rated 4.9 out of 5">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                  <strong>4.9</strong>
                </div>
                <p>Loved by 2,000+ local players</p>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__photo">
              <img
                src={HERO_IMAGE}
                alt="Floodlit tennis court ready for an evening game"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/court-placeholder.svg';
                }}
              />
              <div className="hero__photo-shade" />
              <span className="hero__venue-chip">
                <MapPin size={15} /> Indiranagar · 2.4 km away
              </span>
            </div>

            <div className="floating-card floating-card--booking">
              <span className="floating-card__icon"><Check size={17} /></span>
              <div>
                <span>Slot confirmed</span>
                <strong>The Green Room</strong>
                <p><CalendarDays size={13} /> Tomorrow · 7:00 PM</p>
              </div>
            </div>

            <div className="floating-card floating-card--slots">
              <div>
                <span>Tonight’s availability</span>
                <strong>3 slots left</strong>
              </div>
              <span className="live-dot" aria-hidden="true" />
            </div>

            <div className="hero__stamp" aria-hidden="true">
              <span>GAME ON</span>
              <i>EST. 2024</i>
            </div>
          </div>
        </div>
      </section>

      <div className="container home-search">
        <form className="search-card" onSubmit={handleSearch}>
          <div className="search-card__intro">
            <span className="search-card__icon"><Search size={19} /></span>
            <div>
              <strong>Find your next slot</strong>
              <span>Six great venues, one booking flow.</span>
            </div>
          </div>

          <label className="search-field">
            <span>Sport</span>
            <select value={sport} onChange={(event) => setSport(event.target.value)}>
              <option value="">Any sport</option>
              {SPORTS.map((item) => (
                <option key={item.name} value={item.name}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="search-field">
            <span>When</span>
            <div className="date-field">
              <input
                type="date"
                value={date}
                min={today}
                max={addDaysYMD(today, 60)}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </label>

          <label className="search-field search-field--static">
            <span>Where</span>
            <div className="static-field"><MapPin size={16} /> Bengaluru</div>
          </label>

          <button type="submit" className="search-card__submit" aria-label="Search available courts">
            <Search size={20} />
            <span>Search</span>
          </button>
        </form>
      </div>

      <section className="section sports-section">
        <div className="container">
          <div className="section-head section-head--center">
            <div>
              <span className="eyebrow">Pick your game</span>
              <h2>What are we playing?</h2>
            </div>
            <p>From five-a-side under lights to a quiet morning on court. There’s a surface for it.</p>
          </div>

          <div className="sport-grid">
            {SPORTS.map((item, index) => (
              <Link
                key={item.name}
                to={`/courts?sport=${encodeURIComponent(item.name)}`}
                className={`sport-tile ${index === 0 ? 'sport-tile--wide' : ''}`}
              >
                <img src={SPORT_IMAGES[item.name]} alt="" loading="lazy" />
                <span className="sport-tile__shade" />
                <span className="sport-tile__index">0{index + 1}</span>
                <span className="sport-tile__content">
                  <strong>{item.label}</strong>
                  <small>{item.blurb}</small>
                </span>
                <span className="sport-tile__arrow"><ArrowUpRight size={17} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Handpicked venues</span>
              <h2>Good courts. Better games.</h2>
            </div>
            <Link to="/courts" className="text-link">
              Explore all courts <ArrowRight size={16} />
            </Link>
          </div>

          {error && (
            <div className="inline-alert">
              We couldn’t load the featured venues. {error}
            </div>
          )}

          <div className="court-grid court-grid--three">
            {loading
              ? [0, 1, 2].map((item) => <SkeletonCard key={item} />)
              : courts.map((court) => <CourtCard key={court._id} court={court} date={today} />)}
          </div>

          {!loading && !error && courts.length === 0 && (
            <div className="empty-card">
              <h3>The courts are warming up.</h3>
              <p>Browse all venues to find your next game.</p>
              <Link to="/courts" className="btn btn--primary">Browse courts</Link>
            </div>
          )}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="how-grid">
            <div className="how-copy">
              <span className="eyebrow eyebrow--light">Zero friction</span>
              <h2>From “anyone up for a game?” to game on.</h2>
              <p>
                No phone tag. No “let me check and get back to you.” Just live availability
                and a confirmed slot in your pocket.
              </p>
              <div className="how-note">
                <TimerReset size={20} />
                <span><strong>60-day booking window</strong>Plan the season, not just the weekend.</span>
              </div>
            </div>

            <div className="steps">
              <article className="step-card">
                <span className="step-card__number">01</span>
                <div className="step-card__icon"><Search size={20} /></div>
                <h3>Find your spot</h3>
                <p>Filter by sport, date and price. Every venue is checked by our team.</p>
              </article>
              <article className="step-card">
                <span className="step-card__number">02</span>
                <div className="step-card__icon"><CalendarDays size={20} /></div>
                <h3>Pick a slot</h3>
                <p>See exactly what’s open and choose the hour that works for your group.</p>
              </article>
              <article className="step-card">
                <span className="step-card__number">03</span>
                <div className="step-card__icon"><Zap size={20} /></div>
                <h3>Play. Pay at the venue.</h3>
                <p>Get an instant booking reference. Show up, check in, and get moving.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section split-section">
        <div className="container split-grid">
          <div className="split-visual">
            <img
              src={SPORT_IMAGES.Basketball}
              alt="Outdoor basketball court at dusk"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/court-placeholder.svg';
              }}
            />
            <div className="split-visual__tag">
              <Clock3 size={18} />
              <div>
                <strong>Late slots, sorted.</strong>
                <span>Most venues open until 11 PM.</span>
              </div>
            </div>
            <div className="split-visual__scribble" aria-hidden="true">
              <span>SHOW UP</span>
              <span>&amp; PLAY</span>
            </div>
          </div>

          <div className="split-copy">
            <span className="eyebrow">Built for real players</span>
            <h2>Less admin. More time on court.</h2>
            <p>
              We obsess over the boring parts — accurate slot data, quick confirmation,
              simple cancellations — so your only job is to bring your A-game.
            </p>

            <ul className="check-list">
              <li><span><Check size={15} /></span><div><strong>Live availability</strong><p>See the actual open hours, not a guess.</p></div></li>
              <li><span><Check size={15} /></span><div><strong>Instant confirmation</strong><p>A booking reference the moment you reserve.</p></div></li>
              <li><span><Check size={15} /></span><div><strong>Easy cancellations</strong><p>Plans changed? Free up the slot from your dashboard.</p></div></li>
              <li><span><Check size={15} /></span><div><strong>No online payment</strong><p>Pay directly at the venue after you play.</p></div></li>
            </ul>

            <Link to="/courts" className="btn btn--primary">
              Browse the courts <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">From the sideline</span>
              <h2>Players keep coming back.</h2>
            </div>
            <div className="rating-summary">
              <strong>4.9</strong>
              <div>
                <span>{[0, 1, 2, 3, 4].map((star) => <Star key={star} size={13} fill="currentColor" />)}</span>
                <p>2,000+ players</p>
              </div>
            </div>
          </div>

          <div className="testimonial-grid">
            {TESTIMONIALS.map((item) => (
              <figure className="testimonial" key={item.name}>
                <div className="testimonial__quote" aria-hidden="true">“</div>
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  <span className="avatar">{item.initials}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta">
            <div className="cta__lines" aria-hidden="true" />
            <span className="eyebrow eyebrow--light"><Users size={14} /> Bring the crew</span>
            <h2>Your court is waiting.</h2>
            <p>Pick a venue, lock in your hour, and get back to the part that matters.</p>
            <div className="cta__actions">
              <Link to="/courts" className="btn btn--accent">
                Book a court <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn--outline-light">Create an account</Link>
            </div>
            <div className="cta__trust">
              <span><ShieldCheck size={16} /> Instant confirmation</span>
              <span><Clock3 size={16} /> Cancel before your slot</span>
              <span><MapPin size={16} /> Across Bengaluru</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
