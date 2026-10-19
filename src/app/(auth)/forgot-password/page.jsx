'use client';

import { useState } from 'react';
import Link from 'next/link';
import TextField from '../_components/TextField';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // TODO(backend): send the reset email. Should show the same message whether
    // or not the email exists so people can't check who has an account
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

      <p className={styles.switch}>
        Remembered it? <Link href="/login" className={styles.inlineLink}>Back to log in</Link>
      </p>
    </section>
  );
}
