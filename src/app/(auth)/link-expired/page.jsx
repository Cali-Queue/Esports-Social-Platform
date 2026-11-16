import ResendVerification from '../_components/ResendVerification';
import Link from 'next/link';
import { CircleX } from 'lucide-react';
import StatusCard from '../_components/StatusCard';
import styles from '../auth.module.css';

export const metadata = { title: 'Link expired · Cali Queue' };

// Where the verification link lands if the token is expired or invalid.
export default function LinkExpiredPage() {
  return (
    <StatusCard
      icon={CircleX}
      tone="red"
      pill="FAILURE"
      title="Link expired"
      actions={
        <>
          <ResendVerification />
          <Link href="/login" className={`${styles.button} ${styles.ghost}`}>Log in</Link>
        </>
      }
    >
      <p className={styles.lead}>
        This verification link is no longer active. Links expire 24 hours after they&apos;re sent.
      </p>
    </StatusCard>
  );
}
