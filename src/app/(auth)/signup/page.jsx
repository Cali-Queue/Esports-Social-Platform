'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextField from '../_components/TextField';
import PasswordField from '../_components/PasswordField';
import styles from '../auth.module.css';

// only checks for .edu for now. backend should check against the Schools
// table so random non-CA schools can't sign up
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.edu$/i;

// returns { field: message } for anything invalid, empty object if it's all good
function validate({ email, gamertag, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your college email.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Use a college email ending in .edu.';
  if (!gamertag.trim()) errors.gamertag = 'Choose a gamertag.';
  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({ email: '', gamertag: '', password: '' });
  const [errors, setErrors] = useState({});

  // clears that field's error as soon as the user starts typing again
  function update(field) {
    return (event) => {
      setValues({ ...values, [field]: event.target.value });
      setErrors({ ...errors, [field]: undefined });
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    // TODO(backend): POST to the signup endpoint, then send the verification email.
    // For now just move on to the next screen.
    router.push('/check-inbox');
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>COLLEGE-ONLY ACCESS</p>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.lead}>Join your campus esports community and verify your student identity.</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="College email"
          type="email"
          autoComplete="email"
          placeholder="you@csus.edu"
          value={values.email}
          onChange={update('email')}
          hint="Use a recognized California college email."
          error={errors.email}
        />
        <TextField
          id="gamertag"
          label="Gamertag"
          type="text"
          autoComplete="nickname"
          maxLength={32}
          placeholder="KairoArc"
          value={values.gamertag}
          onChange={update('gamertag')}
          error={errors.gamertag}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={values.password}
          onChange={update('password')}
          hint="At least 8 characters."
          error={errors.password}
        />

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.purple}`} type="submit">Verify college email</button>
        </div>
      </form>

      <p className={styles.switch}>
        Already have an account? <Link href="/login" className={styles.inlineLink}>Log in</Link>
      </p>
    </section>
  );
}
