import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false, compact = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo--light' : ''}`} aria-label="TurfBook home">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <rect x="1" y="1" width="38" height="38" rx="11" fill="currentColor" />
          <rect x="8.5" y="8.5" width="23" height="23" rx="2.5" stroke="#102d23" strokeWidth="1.8" />
          <path d="M8.5 20h23M20 8.5v23" stroke="#102d23" strokeWidth="1.4" opacity=".75" />
          <circle cx="20" cy="20" r="3.2" fill="#102d23" />
        </svg>
      </span>
      {!compact && (
        <span className="logo__text">
          turf<span>book</span>
          <i aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}
