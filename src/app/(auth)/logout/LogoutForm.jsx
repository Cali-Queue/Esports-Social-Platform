'use client';

import { useState } from 'react';
import { authPost, userProfile } from '../../../lib/auth-client.mjs';
import { useUser } from '../../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import styles from '../auth.module.css';

export default function LogoutPage() {
  const router = useRouter();
  const me = userProfile(useUser());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await authPost('logout');
      if (!response.ok) throw new Error('Logout failed');
      window.location.replace('/login');
    } catch {
      setError('Unable to log out. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <section className={`${styles.card} ${styles.centered}`}>
      <div className={`${styles.iconBox} ${styles.red}`}><LogOut size={26} /></div>
      <h1 className={styles.title}>Log out?</h1>
      <p className={styles.lead}>You&apos;ll need to log in again to access your profile and teams.</p>

      <div className={styles.account}>
        <span className={styles.avatar}>{me.initials}</span>
        <div>
          <div className={styles.accountName}>{me.gamertag}</div>
          <div className={styles.accountEmail}>{me.email}</div>
        </div>
      </div>
      <p className={styles.warning}>Unsaved draft edits will be cleared.</p>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actionsRow}>
        <button type="button" className={`${styles.button} ${styles.ghost}`} disabled={submitting} onClick={() => router.back()}>Cancel</button>
        <button type="button" className={`${styles.button} ${styles.redButton}`} disabled={submitting} onClick={handleLogout}>Log out</button>
      </div>
    </section>
  );
}
