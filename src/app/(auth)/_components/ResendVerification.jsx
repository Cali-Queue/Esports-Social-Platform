'use client';

import { useState } from 'react';
import { authPost } from '../../../lib/auth-client.mjs';
import styles from '../auth.module.css';

export default function ResendVerification() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function resend() {
    setBusy(true);
    try {
      const response = await authPost('resend-verification');
      const data = await response.json();
      setMessage(response.status === 401 ? 'Log in to request a new verification email.' : data.detail);
    } catch { setMessage('Unable to send email. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div><button type="button" className={`${styles.button} ${styles.purple}`} disabled={busy} onClick={resend}>{busy ? 'Sending…' : 'Resend link'}</button><p role="status">{message}</p></div>;
}
