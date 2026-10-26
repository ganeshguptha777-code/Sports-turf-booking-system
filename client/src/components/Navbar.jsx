import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initials } from '../utils/format';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/courts', label: 'Find a court' },
  { to: '/bookings', label: 'My bookings', auth: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    toast.info('You have been signed out.');
    navigate('/');
  }

  const visibleLinks = links.filter((link) => !link.auth || user);

  return (
    <>
      <div className="announcement">
        <p>
          <span className="announcement__pulse" aria-hidden="true" />
          New here? Book in under a minute. Pay at the venue.
          <Link to="/courts">Find your game <span aria-hidden="true">→</span></Link>
        </p>
      </div>

      <header className="navbar">
        <div className="container navbar__inner">
          <Logo />

          <nav className="navbar__links" aria-label="Main navigation">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="navbar__actions">
            {user ? (
              <>
                <Link to="/bookings" className="nav-user">
                  <span className="avatar">{initials(user.name)}</span>
                  <span className="nav-user__name">{user.name.split(' ')[0]}</span>
                  <span className="sr-only">— view your profile and bookings</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="icon-button nav-admin-link" aria-label="Admin dashboard">
                    <LayoutDashboard size={18} />
                  </Link>
                )}
                <button type="button" className="icon-button" onClick={handleLogout} aria-label="Sign out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm">Sign in</Link>
                <Link to="/courts" className="btn btn--primary btn--sm">
                  Book a court
                </Link>
              </>
            )}
            <button
              type="button"
              className="icon-button navbar__toggle"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <div className="mobile-menu__inner">
            <div className="mobile-menu__profile">
              {user ? (
                <>
                  <span className="avatar avatar--lg">{initials(user.name)}</span>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="mobile-menu__ball" aria-hidden="true" />
                  <div>
                    <strong>Ready to play?</strong>
                    <span>Find a court near you.</span>
                  </div>
                </>
              )}
            </div>

            <nav className="mobile-menu__links" aria-label="Mobile navigation">
              {visibleLinks.map((link, index) => (
                <NavLink key={link.to} to={link.to} end={link.end}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {link.label}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink to="/admin">
                  <span>04</span>
                  Admin dashboard
                </NavLink>
              )}
            </nav>

            <div className="mobile-menu__actions">
              {user ? (
                <>
                  <Link to="/bookings" className="btn btn--primary btn--block">
                    <CalendarDays size={17} /> My bookings
                  </Link>
                  <button type="button" className="btn btn--ghost btn--block" onClick={handleLogout}>
                    <LogOut size={17} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/courts" className="btn btn--primary btn--block">Find a court</Link>
                  <Link to="/login" className="btn btn--ghost btn--block">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
