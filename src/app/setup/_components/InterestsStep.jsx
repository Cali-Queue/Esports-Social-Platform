import Link from 'next/link';
import styles from '../setup.module.css';

// Step 4 form: interests as free text for now.
// UI only — nothing is saved yet.
export default function InterestsStep({ nextHref }) {
  return (
    <form className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="setup-interests" className={styles.label}>Interests</label>
        <textarea
          id="setup-interests"
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          placeholder="Scrims, recruiting, events, finding a team..."
        />
      </div>

      <Link href={nextHref} className={`${styles.button} ${styles.purple}`}>Finish setup</Link>
    </form>
  );
}
