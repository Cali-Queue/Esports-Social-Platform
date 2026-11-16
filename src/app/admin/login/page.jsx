'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../admin.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,}$/;

// Accepts a staff email or a username. Anything with "@" is checked as an email.
function validateIdentity(value) {
  const v = value.trim();
  if (!v) return 'Enter your staff email or username.';
  if (v.includes('@')) return EMAIL_PATTERN.test(v) ? '' : 'Enter a valid email, like name@caliqueue.org.';
  return USERNAME_PATTERN.test(v) ? '' : 'Usernames are at least 3 characters: letters, numbers, . _ or -.';
}

function validatePassword(value) {
  if (!value) return 'Enter your password.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return '';
}

function validateMfa(value) {
  const digits = value.replace(/\s/g, '');
  if (!digits) return 'Enter the 6-digit code from your authenticator app.';
  return /^\d{6}$/.test(digits) ? '' : 'MFA code must be exactly 6 digits.';
}

function validateSignIn(values) {
  return {
    identity: validateIdentity(values.identity),
    password: validatePassword(values.password),
    mfa: validateMfa(values.mfa),
  };
}

function Field({ id, label, error, children }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className={styles.fieldError} role="alert">{error}</p>}
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const identityRef = useRef(null);
  const [values, setValues] = useState({ identity: '', password: '', mfa: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  function change(field, value) {
    const next = { ...values, [field]: value };
    setValues(next);
    // after the first submit, re-check as they type so errors clear right away
    if (submitted) setErrors(validateSignIn(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    const result = validateSignIn(values);
    setErrors(result);
    const firstBad = Object.keys(result).find((key) => result[key]);
    if (firstBad) {
      document.getElementById(`admin-${firstBad}`)?.focus();
      return;
    }
    // TODO(backend): send identity, password and MFA code to the staff login endpoint
    // and show its error message here when it fails.
    router.push('/admin');
  }

  function handleReset(event) {
    event.preventDefault();
    const v = resetEmail.trim();
    let message = '';
    if (!v) message = 'Enter your staff email.';
    else if (!EMAIL_PATTERN.test(v)) message = 'Enter a valid email, like name@caliqueue.org.';
    setResetError(message);
    // TODO(backend): request the recovery link.
    setResetSent(!message);
  }

  function backToSignIn() {
    setResetEmail('');
    setResetError('');
    setResetSent(false);
    identityRef.current?.focus();
  }

  const describedBy = (field) => (errors[field] ? `admin-${field}-error` : undefined);

  return (
    <div className={styles.loginPage}>
      <section className={styles.loginIntro}>
        <p className={styles.loginBrand}>California Collegiate Esports · ADMIN</p>
        <span className={`${styles.chip} ${styles.chipOrange}`}>STAFF ACCESS</span>
        <h1 className={styles.loginTitle}>Trust operations for California’s college network.</h1>
        <p className={styles.muted}>Role-scoped school oversight, account health, wiki review, and moderation.</p>
        <p className={styles.banner}>Platform mod sees whole-site reports. School mod sees one campus. Staff access requires MFA.</p>
        <Link href="/" className={styles.backLink}>← Back to Cali Queue</Link>
      </section>

      <div className={styles.loginCards}>
        <form className={styles.loginCard} onSubmit={handleSubmit} noValidate aria-labelledby="signin-title">
          <h2 id="signin-title" className={styles.cardTitle}>Admin sign in</h2>

          <Field id="admin-identity" label="Staff email or username" error={errors.identity}>
            <input
              ref={identityRef}
              id="admin-identity"
              className={styles.input}
              type="text"
              autoComplete="username"
              placeholder="moderation@caliqueue.org"
              value={values.identity}
              onChange={(e) => change('identity', e.target.value)}
              aria-invalid={Boolean(errors.identity)}
              aria-describedby={describedBy('identity')}
            />
          </Field>

          <Field id="admin-password" label="Password" error={errors.password}>
            <div className={styles.passwordWrap}>
              <input
                id="admin-password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => change('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={describedBy('password')}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>

          <Field id="admin-mfa" label="MFA code" error={errors.mfa}>
            <input
              id="admin-mfa"
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              placeholder="482 109"
              value={values.mfa}
              onChange={(e) => change('mfa', e.target.value.replace(/[^\d ]/g, ''))}
              aria-invalid={Boolean(errors.mfa)}
              aria-describedby={describedBy('mfa')}
            />
          </Field>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Open admin console</button>
        </form>

        <form className={styles.loginCard} onSubmit={handleReset} noValidate aria-labelledby="reset-title">
          <h2 id="reset-title" className={styles.cardTitle}>Reset access</h2>
          <p className={styles.small}>Request a time-limited recovery link. Staff approval is required.</p>

          <Field id="reset-email" label="Staff email" error={resetError}>
            <input
              id="reset-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder="moderation@caliqueue.org"
              value={resetEmail}
              onChange={(e) => { setResetEmail(e.target.value); setResetSent(false); if (resetError) setResetError(''); }}
              aria-invalid={Boolean(resetError)}
              aria-describedby={resetError ? 'reset-email-error' : undefined}
            />
          </Field>

          {resetSent && (
            <p className={styles.success} role="status">Request sent. A staff lead will approve it before the link is emailed.</p>
          )}

          <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>Request reset</button>
          <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={backToSignIn}>Back to sign in</button>
        </form>
      </div>
    </div>
  );
}
