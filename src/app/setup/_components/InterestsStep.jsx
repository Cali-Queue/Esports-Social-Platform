'use client';

import { useEffect, useState } from 'react';
import useSetupStep from './useSetupStep';
import styles from '../setup.module.css';

// Step 4 form: interests as comma-separated text (maybe tab selections tbd...)
// saved as a list, e.g. "Scrims, recruiting" -> ["Scrims", "recruiting"]
export default function InterestsStep({ nextHref }) {
  const { profile, errors, formError, saving, submit } = useSetupStep(nextHref);
  const [interests, setInterests] = useState('');

  // fill in what's already saved once the profile loads
  useEffect(() => {
    if (!profile) return;
    setInterests(profile.interests.join(', '));
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();
    // split on commas; the server trims and drops blanks
    submit({ interests: interests.split(',') });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="setup-interests" className={styles.label}>Interests</label>
        <textarea
          id="setup-interests"
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          placeholder="Scrims, recruiting, events, finding a team..."
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
        />
        {errors.interests ? <p className={styles.error}>{errors.interests}</p> : <p className={styles.hint}>Separate with commas</p>}
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button type="submit" className={`${styles.button} ${styles.purple}`} disabled={!profile || saving}>
        {saving ? 'Saving…' : 'Finish setup'}
      </button>
    </form>
  );
}
