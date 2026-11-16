'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextField from '../_components/TextField';
import PasswordField from '../_components/PasswordField';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // shown under the password field
  const [submitting, setSubmitting] = useState(false); // disables the button while the request runs

  // sends email + password to Django; on success the session cookie is set and we go home
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return; // ignore double clicks
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      // Django rejects POSTs without a CSRF token. this sets the csrftoken cookie, then we read it
      await fetch('/api/auth/csrf');
      const csrfToken = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.split('=')[1] ?? '';

      // goes through the /api proxy in next.config.mjs to Django's login view
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      // some error responses aren't JSON (e.g. Django's HTML 403 page), so fall back to {}
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push('/home');
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
          <button className={`${styles.button} ${styles.purple}`} type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>

      <p className={styles.switch}>
        New to Cali Queue? <Link href="/signup" className={styles.inlineLink}>Create an account</Link>
      </p>
    </section>
  );
}
