'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useSetupStep from './useSetupStep';
import styles from '../setup.module.css';

const gradYears = [2026, 2027, 2028, 2029, 2030];

// Step 2 form: campus and graduation year.
// campuses come from the Schools table (empty until schools are added to the database)
export default function SchoolStep({ nextHref }) {
  const { profile, errors, formError, saving, submit } = useSetupStep(nextHref);
  const [campuses, setCampuses] = useState(null); // null while loading, then [{ id, name }]
  const [schoolId, setSchoolId] = useState('');
  const [gradYear, setGradYear] = useState('');

  // load the campus list from the Discover endpoint
  useEffect(() => {
    fetch('/api/discover/schools')
      .then((res) => res.json())
      .then((data) => setCampuses(data.schools ?? []))
      .catch(() => setCampuses([]));
  }, []);

  // fill in what's already saved once the profile loads
  useEffect(() => {
    if (!profile) return;
    setSchoolId(profile.school ? String(profile.school.id) : '');
    setGradYear(profile.grad_year ? String(profile.grad_year) : '');
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();
    // '' means nothing picked, which saves as empty
    submit({ school_id: schoolId || null, grad_year: gradYear || null });
  }

  const noCampuses = campuses !== null && campuses.length === 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="setup-campus" className={styles.label}>Campus</label>
        <div className={styles.selectWrap}>
          <select
            id="setup-campus"
            className={`${styles.input} ${styles.select}`}
            value={schoolId}
            onChange={(event) => setSchoolId(event.target.value)}
            disabled={!campuses || noCampuses}
            required
          >
            <option value="" disabled>
              {!campuses ? 'Loading schools…' : noCampuses ? 'No schools available yet' : 'Select your school'}
            </option>
            {campuses?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
        {errors.school_id && <p className={styles.error}>{errors.school_id}</p>}
        {noCampuses && <p className={styles.hint}>You can skip this for now and add your school later.</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-grad-year" className={styles.label}>Graduation year</label>
        <div className={styles.selectWrap}>
          <select
            id="setup-grad-year"
            className={`${styles.input} ${styles.select}`}
            value={gradYear}
            onChange={(event) => setGradYear(event.target.value)}
            required
          >
            <option value="" disabled>Select year</option>
            {gradYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
        {errors.grad_year && <p className={styles.error}>{errors.grad_year}</p>}
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button type="submit" className={`${styles.button} ${styles.purple}`} disabled={!profile || saving}>
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
