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
          {/* TODO(backend): send a new verification email */}
          <button type="button" className={`${styles.button} ${styles.redButton}`}>Send a new link</button>
          <Link href="/signup" className={`${styles.button} ${styles.ghost}`}>Back to sign up</Link>
        </>
      }
    >
      <p className={styles.lead}>
        This verification link is no longer active. Links expire 20 minutes after they&apos;re sent.
      </p>
    </StatusCard>
  );
}
