import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InlineLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SPORT_IMAGES } from '../utils/sports';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/courts';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Those passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const nextUser = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success(`You’re in, ${nextUser.name.split(' ')[0]}. Time to play.`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      image={SPORT_IMAGES.Football}
      alt="Floodlit football turf"
      kicker="Join the home team"
      quote="One link in the group chat. Eight players. One turf. This is how the Wednesday game finally became a tradition."
      person={{ initials: 'RM', name: 'Rohan Mehta', detail: 'Books The Green Room weekly' }}
    >
      <div className="auth-card__heading">
        <span className="eyebrow">Create your account</span>
        <h1>Good games start here.</h1>
        <p>Book in seconds, keep every slot in one place, and pay at the venue.</p>
      </div>

      {error && <div className="form-alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-field">
            <span>Full name</span>
            <div className="input-shell">
              <User size={17} />
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                placeholder="Aarav Sharma"
                required
              />
            </div>
          </label>

          <label className="form-field">
            <span>Phone <small>(optional)</small></span>
            <div className="input-shell">
              <Phone size={17} />
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+91 98765 43210"
              />
            </div>
          </label>
        </div>

        <label className="form-field">
          <span>Email address</span>
          <div className="input-shell">
            <Mail size={17} />
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <div className="form-row">
          <label className="form-field">
            <span>Password</span>
            <div className="input-shell">
              <Lock size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <button
                type="button"
                className="input-shell__action"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <label className="form-field">
            <span>Confirm password</span>
            <div className="input-shell">
              <Lock size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="One more time"
                minLength={8}
                required
              />
            </div>
          </label>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? <InlineLoader label="Creating account…" /> : <>Create account <ArrowRight size={17} /></>}
        </button>
      </form>

      <div className="auth-perks">
        <span>Instant booking</span>
        <span>Pay at venue</span>
        <span>Free cancellation</span>
      </div>

      <p className="auth-switch">
        Already have an account? <Link to="/login" state={{ from }}>Sign in</Link>
      </p>

      <p className="auth-fineprint">
        We’ll only use your details to manage bookings and venue updates. No spam, no endless group forwards.
      </p>
    </AuthLayout>
  );
}
