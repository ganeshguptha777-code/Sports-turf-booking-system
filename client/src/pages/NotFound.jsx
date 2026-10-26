import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <div className="not-found__score">
          <span>4</span>
          <span className="not-found__ball"><CalendarDays size={30} /></span>
          <span>4</span>
        </div>
        <span className="eyebrow">Out of bounds</span>
        <h1>This page missed the line.</h1>
        <p>The court you’re looking for isn’t here, but there are plenty of others ready for a game.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--ghost"><ArrowLeft size={17} /> Back home</Link>
          <Link to="/courts" className="btn btn--primary">Find a court</Link>
        </div>
      </div>
    </section>
  );
}
