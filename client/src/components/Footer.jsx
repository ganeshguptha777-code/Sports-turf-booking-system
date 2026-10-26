import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo light />
            <p>Courts, turfs and good games — all in one place. Find a spot, lock it in, show up ready.</p>
            <div className="footer__socials" aria-label="Social links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="mailto:hello@turfbook.in" aria-label="Email TurfBook">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h3>Play</h3>
            <Link to="/courts?sport=Football">Football turfs</Link>
            <Link to="/courts?sport=Tennis">Tennis courts</Link>
            <Link to="/courts?sport=Basketball">Basketball courts</Link>
            <Link to="/courts?sport=Badminton">Badminton courts</Link>
            <Link to="/courts?sport=Cricket">Cricket grounds</Link>
          </div>

          <div className="footer__col">
            <h3>TurfBook</h3>
            <Link to="/">Home</Link>
            <Link to="/courts">Find a court</Link>
            <Link to="/bookings">My bookings</Link>
            <Link to="/login">Sign in</Link>
          </div>

          <div className="footer__col footer__contact">
            <h3>Say hello</h3>
            <a href="mailto:hello@turfbook.in"><Mail size={16} /> hello@turfbook.in</a>
            <a href="tel:+919876543210"><Phone size={16} /> +91 98765 43210</a>
            <span><MapPin size={16} /> Bengaluru, India</span>
            <Link to="/courts" className="footer__arrow-link">
              Book your next game <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} TurfBook. Built for the love of the game.</p>
          <div>
            <span>Pay at venue</span>
            <span>Free slot cancellation</span>
            <span>Open daily</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
