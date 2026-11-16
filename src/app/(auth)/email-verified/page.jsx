import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import StatusCard from '../_components/StatusCard';
import styles from '../auth.module.css';

export const metadata = { title: 'Email verified · Cali Queue' };


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
        Your college email has been verified.
      </p>
    </StatusCard>
  );
}
