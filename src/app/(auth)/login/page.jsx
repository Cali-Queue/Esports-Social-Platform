'use client';

import { authPost } from '../../../lib/auth-client.mjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import TextField from '../_components/TextField';
import PasswordField from '../_components/PasswordField';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // shown under the password field
  const [submitting, setSubmitting] = useState(false); // disables the button while the request runs
  // set when Django says this email is locked out (429), see accounts/login_protection.py
  const [lockout, setLockout] = useState(null); // { email, until: Date }
  const [now, setNow] = useState(() => Date.now());

  // only the email that got locked is blocked, so typing a different email re-enables the button
  const sameEmail = lockout?.email === email.trim().toLowerCase();
  const lockoutOver = Boolean(lockout) && now >= lockout.until.getTime();
  const locked = sameEmail && !lockoutOver;

  // tick once a second during a lockout so the countdown updates and the button unlocks on time
  useEffect(() => {
    if (!lockout || lockoutOver) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockout, lockoutOver]);

  // sends email + password to Django; on success the session cookie is set and we go home
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || locked) return; // ignore double clicks and clicks during a lockout
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authPost('login', { email: email.trim(), password });
      // some error responses aren't JSON (e.g. Django's HTML 403 page), so fall back to {}
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.replace(data.user.isEmailVerified ? '/home' : '/check-inbox');
        router.refresh();
        return;
      }

      // 429 = too many failed attempts, login is paused until lockedUntil (even with the right password)
      if (res.status === 429) {
        const until = data.lockedUntil ? new Date(data.lockedUntil) : new Date(Date.now() + (data.retryAfter ?? 900) * 1000);
        setLockout({ email: email.trim().toLowerCase(), until });
        setNow(Date.now());
        setPassword('');
        setSubmitting(false);
        return;
      }

      // 401 = wrong email or password (Django sends the same message for both)
      setError(data.detail || 'Something went wrong. Please try again.');
    } catch {
      // fetch itself failed: Django/Next not running, or the user is offline
      setError("Can't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  // clear the error as soon as the user edits either field
  function edit(setter) {
    return (event) => {
      setter(event.target.value);
      setError('');
    };
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>WELCOME BACK</p>
      <h1 className={styles.title}>Log in</h1>
      <p className={styles.lead}>Pick up where you left off with your campus team.</p>

      {locked && (
        <div className={styles.lockout} role="alert">
          <Lock size={16} />
          <div>
            <p className={styles.lockoutTitle}>Login paused</p>
            <p>
              Too many failed login attempts. For your security, you can try again
              at <strong>{formatTime(lockout.until)}</strong> (in {formatCountdown(lockout.until.getTime() - now)}).
            </p>
          </div>
        </div>
      )}
      {sameEmail && lockoutOver && (
        <p className={`${styles.notice} ${styles.lockoutOver}`} role="status">The lockout is over. You can try logging in again.</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="College email"
          type="email"
          autoComplete="email"
          placeholder="you@csus.edu"
          value={email}
          onChange={edit(setEmail)}
        />
        <PasswordField
          id="password"
          label="Password"
          labelAside={<Link href="/forgot-password" className={styles.inlineLink}>Forgot password?</Link>}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={edit(setPassword)}
          error={error}
        />

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.purple}`} type="submit" disabled={submitting || locked}>
            {submitting ? 'Logging in…' : locked ? 'Try again later' : 'Log in'}
          </button>
        </div>
      </form>

      <p className={styles.switch}>
        New to Cali Queue? <Link href="/signup" className={styles.inlineLink}>Create an account</Link>
      </p>
    </section>
  );
}

// e.g. "3:42 PM" in the user's own time zone
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// e.g. "14:05" (minutes:seconds)
function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
