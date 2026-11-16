'use client';

import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import useSetupStep from './useSetupStep';
import styles from '../setup.module.css';

// Step 1 form: avatar, banner, bio, real name
// bio + real name are saved. avatar/banner upload is a separate subtask
export default function BioAccountStep({ nextHref }) {
  const { profile, errors, formError, saving, submit } = useSetupStep(nextHref);
  const [bio, setBio] = useState('');
  const [realName, setRealName] = useState('');

  // fill in what's already saved once the profile loads
  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio);
    setRealName(profile.real_name);
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();
    submit({ bio, real_name: realName });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.media}>
        {/* TODO(avatar subtask): upload + show the real avatar instead of initials */}
        <label className={styles.avatarUpload} title="Upload avatar">
          KA
          <input type="file" accept="image/*" className={styles.fileInput} aria-label="Upload avatar" />
        </label>
        <label className={styles.bannerUpload}>
          <ImagePlus size={16} />
          <span>Upload banner</span>
          <input type="file" accept="image/*" className={styles.fileInput} />
        </label>
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-bio" className={styles.label}>Bio</label>
        <textarea
          id="setup-bio"
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          maxLength={160}
          placeholder="Controller main, looking for scrims on weeknights."
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
        {errors.bio ? <p className={styles.error}>{errors.bio}</p> : <p className={styles.hint}>Up to 160 characters</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-real-name" className={styles.label}>Real name</label>
        <input
          id="setup-real-name"
          className={styles.input}
          placeholder="Kaden A."
          maxLength={200}
          value={realName}
          onChange={(event) => setRealName(event.target.value)}
        />
        {errors.real_name && <p className={styles.error}>{errors.real_name}</p>}
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      {/* disabled until the profile loads so we never save over it with empty fields */}
      <button type="submit" className={`${styles.button} ${styles.purple}`} disabled={!profile || saving}>
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
