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

// 13 is the COPPA floor. adjust if the club wants a higher minimum
const MIN_AGE = 13;
const MAX_AGE = 120;

// returns { field: message } for anything invalid, empty object if it's all good
function validate({ name, age, email, gamertag, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Enter your full name.';
  if (!age.trim()) errors.age = 'Enter your age.';
  else if (!/^\d+$/.test(age.trim())) errors.age = 'Age must be a whole number.';
  else if (Number(age) < MIN_AGE) errors.age = `You must be at least ${MIN_AGE} to sign up.`;
  else if (Number(age) > MAX_AGE) errors.age = 'Enter a valid age.';
  if (!email.trim()) errors.email = 'Enter your college email.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Use a college email ending in .edu.';
  if (!gamertag.trim()) errors.gamertag = 'Choose a gamertag.';
  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({ name: '', age: '', email: '', gamertag: '', password: '' });
  const [errors, setErrors] = useState({}); // per-field messages, shown under each input
  const [formError, setFormError] = useState(''); // errors not tied to a field (server down, etc)
  const [submitting, setSubmitting] = useState(false); // disables the button while the request runs

  // clears that field's error as soon as the user starts typing again
  function update(field) {
    return (event) => {
      setValues({ ...values, [field]: event.target.value });
      setErrors({ ...errors, [field]: undefined });
    };
  }

  // checks the form locally first, then sends it to Django to create the account
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return; // ignore double clicks
    const found = validate(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      // Django rejects POSTs without a CSRF token. this sets the csrftoken cookie, then we read it
      await fetch('/api/auth/csrf');
      const csrfToken = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.split('=')[1] ?? '';

      // goes through the /api proxy in next.config.mjs to Django's signup view.
      // send trimmed values; age goes as a number
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          email: values.email.trim(),
          gamertag: values.gamertag.trim(),
          age: Number(values.age),
        }),
      });
      // some error responses aren't JSON (e.g. Django's HTML 403 page), so fall back to {}
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // account is created and logged in. TODO: go to /check-inbox once the
        // verification email is actually sent; until then go straight to setup.
        router.push('/setup');
        return;
      }

      // 400 = field errors from Django (e.g. email taken), shown under each field
      if (res.status === 400 && data.errors) setErrors(data.errors);
      else setFormError(data.detail || 'Something went wrong. Please try again.');
    } catch {
      // fetch itself failed: Django/Next not running, or the user is offline
      setFormError("Can't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>COLLEGE-ONLY ACCESS</p>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.lead}>Join your campus esports community and verify your student identity.</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* saved as User.real_name */}
        <TextField
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          maxLength={200}
          placeholder="Kairo Arcadio"
          value={values.name}
          onChange={update('name')}
          hint="Your real name. You can hide it on your profile later."
          error={errors.name}
        />
        {/* saved as User.age; min/max mirror MIN_AGE/MAX_AGE in accounts/views.py */}
        <TextField
          id="age"
          label="Age"
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          placeholder="19"
          value={values.age}
          onChange={update('age')}
          error={errors.age}
        />
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

        {/* general error that doesn't belong to a single field */}
        {formError && <p className={styles.error} role="alert">{formError}</p>}

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.purple}`} type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      <p className={styles.switch}>
        Already have an account? <Link href="/login" className={styles.inlineLink}>Log in</Link>
      </p>
    </section>
  );
}
