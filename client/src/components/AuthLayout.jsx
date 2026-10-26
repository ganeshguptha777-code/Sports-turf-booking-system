import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, MapPin } from 'lucide-react';

export default function AuthLayout({ image, alt, kicker, quote, person, children }) {
  return (
    <section className="auth-page">
      <div className="auth-page__visual">
        <img
          src={image}
          alt={alt || 'A sports court ready for a game'}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/court-placeholder.svg';
          }}
        />
        <div className="auth-page__visual-shade" />
        <Link to="/" className="auth-page__back"><ArrowLeft size={16} /> Back to TurfBook</Link>

        <div className="auth-page__visual-content">
          <span className="eyebrow eyebrow--light">{kicker}</span>
          <blockquote>“{quote}”</blockquote>
          <div className="auth-page__person">
            <span className="avatar">{person?.initials || 'TB'}</span>
            <div>
              <strong>{person?.name || 'TurfBook player'}</strong>
              <span>{person?.detail || 'Plays every week'}</span>
            </div>
          </div>
        </div>

        <div className="auth-page__float-card">
          <span className="auth-page__float-icon"><Check size={17} /></span>
          <div>
            <span>Slot confirmed</span>
            <strong>Baseline Club</strong>
            <p><CalendarDays size={13} /> Today · 7:00 PM</p>
          </div>
          <span className="auth-page__float-location"><MapPin size={14} /> 2.4 km</span>
        </div>
      </div>

      <div className="auth-page__panel">
        <div className="auth-card">{children}</div>
      </div>
    </section>
  );
}
