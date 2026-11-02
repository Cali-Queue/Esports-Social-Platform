import Link from 'next/link';
import styles from '../setup.module.css';

// the text and color for the badge in the top-right corner, based on the step's status
const badges = {
  complete: { label: 'Complete', className: styles.badgeComplete }, // teal
  current: { label: 'Current', className: styles.badgeCurrent },    // purple
  next: { label: 'Up next', className: styles.badgeNext },          // gray
};

//page.jsx renders this 4 times which is once per step
//   number:step number shown in the left corner of the tab you are on
//   title: tab heading
//   description: the description of the tab you are on
//   status:
//   editHref    - where the Edit link goes, e.g. '/setup?step=2'
//   preview     - optional extra content for finished cards (step 1's avatar + banner)
//   children    - the step's form, only shown when this is the current step
export default function StepCard({ number, title, description, status, editHref, preview, children })
 {
  const badge = badges[status];
  const isCurrent = status === 'current';

  return (
    // The current step gets a purple-tinted background (cardCurrent).
    <section className={`${styles.card} ${isCurrent ? styles.cardCurrent : ''}`} aria-current={isCurrent ? 'step' : undefined}>
      {/* Top row: step number on the left, status badge on the right */}
      <div className={styles.cardTop}>
        <span className={styles.stepNumber}>{number}</span>
        <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
      </div>

      {/* Preview is hidden on the current step because the form shows the real fields instead */}
      {!isCurrent && preview}

      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardDescription}>{description}</p>

      {/* Current step shows its form; every other step shows an Edit link back to it */}
      {isCurrent ? children : (
        <Link href={editHref} className={`${styles.button} ${styles.ghost}`}>Edit</Link>
      )}
    </section>
  );
}
