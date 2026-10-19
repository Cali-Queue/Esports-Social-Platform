import Link from 'next/link';
import { SearchX } from 'lucide-react';
import styles from '../../main.module.css';

export default function PlayerNotFound() {
  return (
    <div className={styles.notFound}>
      <div className={`${styles.panel} ${styles.notFoundCard}`}>
        <SearchX size={28} />
        <h1 className={styles.panelTitle}>Player not found</h1>
        <p>This profile doesn’t exist or isn’t public anymore.</p>
        <div className={styles.notFoundActions}>
          <Link href="/discover" className={`${styles.btn} ${styles.btnPrimary}`}>Discover players</Link>
          <Link href="/profile" className={`${styles.btn} ${styles.btnOutline}`}>My profile</Link>
        </div>
      </div>
    </div>
  );
}
