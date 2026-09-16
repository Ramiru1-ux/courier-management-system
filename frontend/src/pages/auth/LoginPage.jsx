import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import { generateOtp, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from '../../utils/authSecurity';
import { PORTAL_ROLE } from '../../config/portal';
import AUTH_ACCOUNTS from '../../config/authAccounts';

const styles = `
  .auth-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f1a2f 0%, #12213F 45%, #1b2e5c 100%);
    padding: 32px;
  }

  .auth-card {
    width: min(430px, 100%);
    background: #fff;
    border-radius: 20px;
    padding: 40px 38px;
    box-shadow: 0 20px 40px rgba(18, 33, 63, 0.28);
  }

  .auth-brand { display: flex; align-items: center; gap: 11px; margin-bottom: 28px; }
  .auth-brand-mark { width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, #F5A524, #D9860F); color: #211200; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; font-family: 'Sora', sans-serif; }
  .auth-brand-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 16px; color: #12213F; }

  .auth-kicker { font-size: 11.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9AA1B4; }
  .auth-title { margin: 10px 0 4px; font-family: 'Sora', sans-serif; font-size: 26px; color: #12213F; }
  .auth-subtitle { color: #697086; font-size: 13.5px; margin-bottom: 26px; }

  .auth-form { display: flex; flex-direction: column; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 12px; font-weight: 600; color: #697086; }
  .field input, .field select {
    width: 100%; border: 1.5px solid #E3E7EF; border-radius: 9px;
    padding: 10px 12px; font-size: 13.5px; color: #151A2E; background: #fff; height: 46px;
  }
  .field input:focus, .field select:focus { outline: none; border-color: #F5A524; box-shadow: 0 0 0 4px rgba(245,165,36,.12); }
  .field input::placeholder { color: #9AA1B4; }
  .password-input { position: relative; }
  .password-input input { padding-right: 42px; }
  .password-toggle {
    position: absolute; top: 50%; right: 10px; transform: translateY(-50%);
    display: inline-flex; align-items: center; justify-content: center;
    border: 0; background: transparent; color: #697086; cursor: pointer; padding: 4px;
  }
  .password-toggle:focus-visible { outline: 2px solid #F5A524; outline-offset: 2px; border-radius: 4px; }
  .field-hint { font-size: 11px; color: #9AA1B4; }

  .auth-error {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 11px 13px; border-radius: 9px;
    background: #FDE9E7; color: #B23528;
    font-size: 12.5px; font-weight: 600; line-height: 1.4;
  }

  .auth-otp-banner {
    display: flex; align-items: flex-start; gap: 9px;
    padding: 12px 13px; border-radius: 9px;
    background: #E4F7F4; color: #087367;
    font-size: 12px; line-height: 1.5; margin-bottom: 4px;
  }
  .auth-otp-code { font-family: 'IBM Plex Mono', monospace; font-weight: 700; letter-spacing: .12em; font-size: 14px; }

  .auth-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; color: #697086; }
  .auth-check { display: inline-flex; align-items: center; gap: 8px; }
  .auth-check input { accent-color: #F5A524; }
  .auth-link { color: #3E7BFA; font-weight: 600; text-decoration: none; }

  .auth-button {
    font-family: 'Sora', sans-serif; font-weight: 600; font-size: 13.5px; border-radius: 10px; border: none;
    cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 20px; transition: transform 0.2s ease;
  }
  .auth-button:hover:not(:disabled) { transform: translateY(-1px); }
  .auth-button:disabled { opacity: .6; cursor: not-allowed; }
  .auth-button-primary { background: #F5A524; color: #211200; }
  .auth-button-ghost { background: transparent; color: #697086; border: 1.5px solid #E3E7EF; }

  @media (max-width: 480px) {
    .auth-shell { padding: 18px; }
    .auth-card { padding: 30px 24px; }
  }
`;

// Credentials are verified by the backend (POST /api/auth/login) against the
// MongoDB `users` collection. Passwords are stored there as bcrypt hashes and
// never leave the server - the browser only ever receives a signed JWT.
const ROLES = Object.values(AUTH_ACCOUNTS);
const MAIN_ROLES = ['admin', 'finance', 'dispatcher', 'merchant'];
const VISIBLE_ROLES = PORTAL_ROLE
  ? ROLES.filter((account) => account.id === PORTAL_ROLE)
  : ROLES.filter((account) => MAIN_ROLES.includes(account.id));

const ROLE_HOME = {
  admin: '/admin', finance: '/finance', dispatcher: '/dispatcher',
  driver: '/driver', merchant: '/merchant', customer: '/customer',
  branch: '/branch', counter: '/counter',
};

function attemptsKey(role) { return `cms_login_attempts_${role}`; }
function lockKey(role) { return `cms_login_lock_${role}`; }

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const defaultRole = PORTAL_ROLE || 'admin';
  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState({ email: AUTH_ACCOUNTS[defaultRole].email, password: '', remember: true });
  const [error, setError] = useState('');
  const [stage, setStage] = useState('credentials'); // credentials | otp
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Holds the { token, user } the backend returned while the one-time code
  // is being confirmed. Nothing is stored in the browser until then.
  const pendingAuthRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_HOME[user.role] || '/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lock = Number(localStorage.getItem(lockKey(role))) || 0;
    setLockedUntil(lock);
  }, [role]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil > now;
  const lockSecondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  const handleRoleChange = (nextRoleId) => {
    const nextRole = AUTH_ACCOUNTS[nextRoleId] || AUTH_ACCOUNTS[defaultRole];
    setRole(nextRole.id);
    setForm((prev) => ({ ...prev, email: nextRole.email }));
    setError('');
    setStage('credentials');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const registerFailedAttempt = (serverMessage) => {
    const count = (Number(localStorage.getItem(attemptsKey(role))) || 0) + 1;
    localStorage.setItem(attemptsKey(role), String(count));
    if (count >= MAX_LOGIN_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(lockKey(role), String(until));
      setLockedUntil(until);
      localStorage.removeItem(attemptsKey(role));
      setError(`Too many failed attempts. Sign-in for this role is locked for ${Math.ceil(LOCKOUT_DURATION_MS / 1000)} seconds.`);
    } else {
      const base = serverMessage || 'Incorrect email or password for the selected role.';
      setError(`${base} ${MAX_LOGIN_ATTEMPTS - count} attempt(s) remaining before a temporary lockout.`);
    }
  };

  const clearFailedAttempts = () => {
    localStorage.removeItem(attemptsKey(role));
    localStorage.removeItem(lockKey(role));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLocked || submitting) return;

    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail || !form.password) {
      setError('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      // The server checks the email + bcrypt password hash in MongoDB and
      // returns a signed JWT. Nothing about the password is decided here.
      const response = await authApi.login({
        email: normalizedEmail,
        password: form.password,
        role,
      });

      clearFailedAttempts();
      setError('');

      // Second factor (FR-01 "Optional 2FA"). No SMS/email provider is
      // configured, so the code is shown in the UI with a clear demo label
      // instead of pretending to deliver it silently.
      const code = generateOtp();
      setOtpCode(code);
      setOtpInput('');
      pendingAuthRef.current = { token: response.token, user: response.data };
      setStage('otp');
      toast.success('Password verified. Enter the verification code to finish signing in.');
    } catch (apiError) {
      if (apiError?.status === 401) {
        registerFailedAttempt(apiError.message);
      } else {
        setError(apiError?.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (otpInput.trim() !== otpCode) {
      setError('That verification code is incorrect. Please try again.');
      return;
    }
    const pending = pendingAuthRef.current;
    if (!pending) {
      setStage('credentials');
      setError('Your sign-in attempt expired. Please enter your password again.');
      return;
    }
    setError('');
    const signedIn = login(pending, { remember: form.remember });
    pendingAuthRef.current = null;
    toast.success(`Signed in as ${signedIn.name}`);
    navigate(ROLE_HOME[signedIn.role] || '/', { replace: true });
  };

  return (
    <div className="auth-shell">
      <style>{styles}</style>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">E</div>
          <div className="auth-brand-name">EgoTECHWORLD</div>
        </div>

        {stage === 'credentials' ? (
          <>
            <div className="auth-kicker">Access portal</div>
            <h1 className="auth-title">Welcome back</h1>
            <div className="auth-subtitle">Sign in to your Courier CMS dashboard.</div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="role">Sign in as</label>
                <select id="role" value={role} onChange={(event) => handleRoleChange(event.target.value)}>
                  {VISIBLE_ROLES.map((r) => <option key={r.id} value={r.id}>{r.roleLabel || `${r.name} portal`}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@egotechworld.com" required />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter your password" disabled={isLocked} />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {isLocked && (
                <div className="auth-error">Locked - try again in {lockSecondsLeft}s.</div>
              )}

              <div className="auth-row">
                <label className="auth-check">
                  <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
                  Remember me
                </label>
                <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-button auth-button-primary" disabled={isLocked || submitting}>
                {submitting ? 'Checking…' : 'Sign in'} <ArrowRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-kicker">Two-factor verification</div>
            <h1 className="auth-title">Enter your code</h1>
            <div className="auth-subtitle">A one-time verification code has been "sent" to {form.email}.</div>

            <div className="auth-otp-banner">
              <ShieldCheck size={16} />
              <span>Demo mode - no SMS/email backend is wired up, so here's the code we would have sent: <span className="auth-otp-code">{otpCode}</span></span>
            </div>

            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="field">
                <label htmlFor="otp">Verification code</label>
                <input id="otp" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="6-digit code" maxLength={6} inputMode="numeric" />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-button auth-button-primary">
                <KeyRound size={16} /> Verify & sign in
              </button>
              <button type="button" className="auth-button auth-button-ghost" onClick={() => { setStage('credentials'); setError(''); }}>
                Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
