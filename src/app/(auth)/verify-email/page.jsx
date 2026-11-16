'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authPost } from '../../../lib/auth-client.mjs';
import styles from '../auth.module.css';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    setBusy(true);
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(null, '', '/verify-email');
    try {
      const response = await authPost('verify-email', { token });
      if (response.ok || response.status === 400) {
        router.replace(response.ok ? '/email-verified' : '/link-expired');
        router.refresh();
      } else { setError('Unable to verify. Reopen the email link and try again.'); }
    } catch { setError('Unable to verify. Reopen the email link and try again.'); }
    setBusy(false);
  }
  return <section className={styles.card}><h1>Verify your college email</h1><p>Confirm to activate your account.</p><button className={`${styles.button} ${styles.purple}`} disabled={busy} onClick={confirm}>{busy ? 'Verifying…' : 'Verify email'}</button><p role="alert">{error}</p></section>;
}
