'use client';

import { useState } from 'react';
import Link from 'next/link';
import TextField from '../_components/TextField';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

    function handleSubmit(event) {
      event.preventDefault();

      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid college email address.');
        setSubmitted(false);
        return;
      }

      setError('');
      setSubmitted(true);
    }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>ACCOUNT RECOVERY</p>
      <h1 className={styles.title}>Forgot password</h1>
      <p className={styles.lead}>Enter your college email and we&apos;ll send you a one-time reset link.</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="College email"
          type="email"
          autoComplete="email"
          placeholder="you@csus.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.purple}`} type="submit">Send reset link</button>
        </div>
      </form>

      {submitted && (
        <p className={styles.lead} role="status">
          If an account exists for {email}, a password reset link
          will be sent to that address.
        </p>
      )}

      {error && (
        <p className={styles.lead} role="alert">
          {error}
        </p>
      )}

      <p className={styles.switch}>
        Remembered it? <Link href="/login" className={styles.inlineLink}>Back to log in</Link>
      </p>
    </section>
  );
}
