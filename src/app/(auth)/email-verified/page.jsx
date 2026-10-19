import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import StatusCard from '../_components/StatusCard';
import styles from '../auth.module.css';

export const metadata = { title: 'Email verified · Cali Queue' };

// Where the verification link lands if the token is valid.
// School name is hardcoded until we can look it up from the email domain.
export default function EmailVerifiedPage() {
  return (
    <StatusCard
      icon={BadgeCheck}
      tone="green"
      pill="SUCCESS"
      title="Email verified"
      actions={
        <Link href="/login" className={`${styles.button} ${styles.purple}`}>Continue to log in</Link>
      }
    >
      <p className={styles.lead}>
        <strong>Sacramento State</strong> affiliation confirmed. You now have Student status.
      </p>
    </StatusCard>
  );
}
