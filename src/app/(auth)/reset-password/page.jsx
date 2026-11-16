'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authPost } from '../../../lib/auth-client.mjs';
import PasswordField from '../_components/PasswordField';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const [credentials, setCredentials] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setCredentials({ uid: params.get('uid'), token: params.get('token') });
    window.history.replaceState(null, '', '/reset-password');
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const response = await authPost('reset-password', { ...credentials, password, confirmPassword });
      const data = await response.json();
      if (response.ok) { setDone(true); setPassword(''); setConfirmPassword(''); }
      else setErrors(data.errors || { detail: data.detail || 'Unable to reset password. Please try again.' });
    } catch { setErrors({ detail: 'Unable to reset password. Please try again.' }); }
    finally { setBusy(false); }
  }

  return <section className={styles.card}>
    <p className={styles.eyebrow}>ACCOUNT RECOVERY</p>
    <h1 className={styles.title}>Reset password</h1>
    {done ? <p className={styles.lead} role="status">Password reset. Log in with your new password.</p> :
      <form className={styles.form} onSubmit={submit}>
        <PasswordField id="password" label="New password" autoComplete="new-password" required value={password} onChange={event => setPassword(event.target.value)} error={errors.password} />
        <PasswordField id="confirmPassword" label="Confirm new password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} error={errors.confirmPassword} />
        <button className={`${styles.button} ${styles.purple}`} disabled={busy} type="submit">{busy ? 'Resetting…' : 'Reset password'}</button>
        {errors.detail && <p role="alert">{errors.detail} <Link href="/forgot-password">Request a new link</Link></p>}
      </form>}
    <p className={styles.switch}><Link href="/login" className={styles.inlineLink}>Back to log in</Link></p>
  </section>;
}
