import Link from 'next/link';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import styles from '../setup.module.css';

// TODO(backend): load campuses from the schools table
const campuses = ['Sacramento State', 'UC Davis', 'UC Berkeley', 'UCLA', 'UC Irvine', 'San Jose State', 'Cal Poly SLO'];
const gradYears = [2026, 2027, 2028, 2029, 2030];

// Step 2 form: campus, graduation year, school email verification.
//ui only, need to implement logic later
export default function SchoolStep({ nextHref }) {
  return (
    <form className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="setup-campus" className={styles.label}>Campus</label>
        <div className={styles.selectWrap}>
          <select id="setup-campus" className={`${styles.input} ${styles.select}`} defaultValue="" required>
            <option value="" disabled>Select your school</option>
            {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-grad-year" className={styles.label}>Graduation year</label>
        <div className={styles.selectWrap}>
          <select id="setup-grad-year" className={`${styles.input} ${styles.select}`} defaultValue="" required>
            <option value="" disabled>Select year</option>
            {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-school-email" className={styles.label}>School email</label>
        <input id="setup-school-email" type="email" className={styles.input} placeholder="you@csus.edu" required />
        <p className={styles.verifyNote}>
          <ShieldCheck size={14} />
          <span>We'll send a link to verify your .edu email and grant Student status.</span>
        </p>
      </div>

      <Link href={nextHref} className={`${styles.button} ${styles.purple}`}>Continue</Link>
    </form>
  );
}
