'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import styles from '../auth.module.css';

export default function LogoutPage() {
  const router = useRouter();

  return (
    <section className={`${styles.card} ${styles.centered}`}>
      <div className={`${styles.iconBox} ${styles.red}`}><LogOut size={26} /></div>
      <h1 className={styles.title}>Log out?</h1>
      <p className={styles.lead}>You&apos;ll need to log in again to access your profile and teams.</p>

      {/* placeholder user, swap for the logged in user once we have sessions */}
      <div className={styles.account}>
        <span className={styles.avatar}>KA</span>
        <div>
          <div className={styles.accountName}>KairoArc</div>
          <div className={styles.accountEmail}>kai@csus.edu</div>
        </div>
      </div>
      <p className={styles.warning}>Unsaved draft edits will be cleared.</p>

      <div className={styles.actionsRow}>
        <button type="button" className={`${styles.button} ${styles.ghost}`} onClick={() => router.back()}>Cancel</button>
        {/* TODO(backend): clear the session and redirect to /login */}
        <button type="button" className={`${styles.button} ${styles.redButton}`}>Log out</button>
      </div>
    </section>
  );
}
