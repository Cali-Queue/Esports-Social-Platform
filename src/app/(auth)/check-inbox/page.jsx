import Link from 'next/link';
import { Mail } from 'lucide-react';
import StatusCard from '../_components/StatusCard';
import styles from '../auth.module.css';

export const metadata = { title: 'Check your inbox · Cali Queue' };

// Shown right after signup. Eventually we should pass the email through
// so we can show "we sent a link to you@csus.edu" instead of the generic text.
export default function CheckInboxPage() {
  return (
    <StatusCard
      icon={Mail}
      pill="INBOX"
      title="Check your inbox"
      actions={
        <>
          {/* TODO(backend): resend verification email */}
          <button type="button" className={`${styles.button} ${styles.purple}`}>Resend link</button>
          <Link href="/signup" className={`${styles.button} ${styles.ghost}`}>Use a different email</Link>
        </>
      }
    >
      <p className={styles.lead}>
        We sent a verification link to your college email. It expires in <strong>20 minutes</strong>.
      </p>
      <p className={styles.hint}>Don&apos;t see it? Check your spam or promotions folder.</p>
    </StatusCard>
  );
}
