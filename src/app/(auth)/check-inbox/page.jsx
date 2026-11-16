import ResendVerification from '../_components/ResendVerification';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import StatusCard from '../_components/StatusCard';
import styles from '../auth.module.css';

export const metadata = { title: 'Check your inbox · Cali Queue' };


export default function CheckInboxPage() {
  return (
    <StatusCard
      icon={Mail}
      pill="INBOX"
      title="Check your inbox"
      actions={
        <>
          <ResendVerification />
          <Link href="/login" className={`${styles.button} ${styles.ghost}`}>Log in</Link>
        </>
      }
    >
      <p className={styles.lead}>
        Check your college email for a verification link. If delivery failed, use Resend link. It expires in <strong>24 hours</strong>.
      </p>
      <p className={styles.hint}>Don&apos;t see it? Check your spam or promotions folder.</p>
    </StatusCard>
  );
}
