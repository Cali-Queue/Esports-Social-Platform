import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import styles from './auth.module.css';

// Shared wrapper for every auth screen (signup, login, verify, etc).
// (auth) is a route group so it doesn't show up in the URL.
export default function AuthLayout({ children }) {
  return (
    <main className={styles.shell}>
      <header className={styles.brandBar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>CQ</span>
          Cali Queue
        </Link>
        <span className={styles.organization}>Sacramento State Club Esports</span>
      </header>

      <div className={styles.stage}>{children}</div>

      <footer className={styles.footer}>
        <p className={styles.notice}>
          <ShieldCheck size={15} />
          <span>Verified email grants Student status. Athlete, Captain, Coach, and moderator badges require school or Staff approval.</span>
        </p>
        {/* remove once verification emails are sent */}
        <p className={styles.disclaimer}>Prototype — verification emails are not sent yet.</p>
      </footer>
    </main>
  );
}
