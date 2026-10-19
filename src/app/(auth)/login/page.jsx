'use client';

import { useState } from 'react';
import Link from 'next/link';
import TextField from '../_components/TextField';
import PasswordField from '../_components/PasswordField';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // TODO(backend): send email + password to the login endpoint.
    // on success redirect to the home page (doesn't exist yet),
    // on failure show an error under the password field
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
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          id="password"
          label="Password"
          labelAside={<Link href="/forgot-password" className={styles.inlineLink}>Forgot password?</Link>}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.purple}`} type="submit">Log in</button>
        </div>
      </form>

      <p className={styles.switch}>
        New to Cali Queue? <Link href="/signup" className={styles.inlineLink}>Create an account</Link>
      </p>
    </section>
  );
}
