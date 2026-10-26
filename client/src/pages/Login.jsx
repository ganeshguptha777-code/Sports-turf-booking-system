import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { InlineLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SPORT_IMAGES } from '../utils/sports';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/courts';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  async function finishLogin(nextUser) {
    toast.success(`Welcome back, ${nextUser.name.split(' ')[0]}.`);
    navigate(from, { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const nextUser = await login(email.trim(), password);
      await finishLogin(nextUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setDemoLoading(true);
    try {
      const nextUser = await login('demo@turfbook.in', 'Demo@1234');
      await finishLogin(nextUser);
    } catch (err) {
      setError(
        `${err.message} Make sure SEED_DEMO is enabled so the demo account exists.`,
      );
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <AuthLayout
      image={SPORT_IMAGES.Tennis}
      alt="Tennis court under floodlights"
      kicker="Members’ entrance"
      quote="The court is booked, the group chat is quiet, and the lights are already on. That’s a good evening."
      person={{ initials: 'NI', name: 'Nisha Iyer', detail: 'Plays Tuesdays at Baseline Club' }}
    >
      <div className="auth-card__heading">
        <span className="eyebrow">Welcome back</span>
        <h1>Your next game is closer than you think.</h1>
        <p>Sign in to see your bookings and lock in a new slot.</p>
      </div>

      {error && <div className="form-alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email address</span>
          <div className="input-shell">
            <Mail size={17} />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <label className="form-field">
          <span>Password</span>
          <div className="input-shell">
            <Lock size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
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

        <button type="submit" className="btn btn--primary btn--block" disabled={loading || demoLoading}>
          {loading ? <InlineLoader label="Signing in…" /> : <>Sign in <ArrowRight size={17} /></>}
        </button>
      </form>

      <div className="auth-divider"><span>or skip the form</span></div>

      <button
        type="button"
        className="demo-login"
        onClick={handleDemoLogin}
        disabled={loading || demoLoading}
      >
        <span className="demo-login__icon"><Sparkles size={17} /></span>
        <span>
          <strong>{demoLoading ? 'Opening demo…' : 'Try the demo account'}</strong>
          <small>Explore with sample bookings already set up.</small>
        </span>
        {!demoLoading && <ArrowRight size={17} />}
      </button>

      <p className="auth-switch">
        New to TurfBook? <Link to="/register" state={{ from }}>Create an account</Link>
      </p>

      <p className="auth-fineprint">
        By continuing you agree to play fair, arrive on time, and leave the court ready for the next game.
      </p>
    </AuthLayout>
  );
}
