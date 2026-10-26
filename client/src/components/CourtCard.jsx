import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { sportsImage } from '../utils/sports';

export default function CourtCard({ court, date }) {
  const target = `/courts/${court._id}${date ? `?date=${date}` : ''}`;

  return (
    <article className="court-card">
      <Link to={target} className="court-card__image">
        <img
          src={court.image || sportsImage(court.sport)}
          alt={`${court.name} — ${court.sport} at ${court.location}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/court-placeholder.svg';
          }}
        />
        <span className="court-card__sport">{court.sport}</span>
        {court.featured && <span className="court-card__featured">Editor’s pick</span>}
        <span className="court-card__arrow" aria-hidden="true">
          <ArrowUpRight size={19} />
        </span>
      </Link>

      <div className="court-card__body">
        <div className="court-card__heading">
          <div>
            <h2>
              <Link to={target}>{court.name}</Link>
            </h2>
            <p className="court-card__location">
              <MapPin size={14} aria-hidden="true" />
              {court.location}
            </p>
          </div>
          <span className="rating">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            {Number(court.rating || 0).toFixed(1)}
          </span>
        </div>

        <p className="court-card__surface">{court.surface}</p>

        <div className="court-card__footer">
          <p>
            <strong>{formatCurrency(court.pricePerHour)}</strong>
            <span>/ hour</span>
          </p>
          <span className="court-card__book">View slots <ArrowUpRight size={15} /></span>
        </div>
      </div>
    </article>
  );
}
