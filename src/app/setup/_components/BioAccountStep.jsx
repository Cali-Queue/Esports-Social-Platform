import Link from 'next/link';
import { ImagePlus } from 'lucide-react';
import styles from '../setup.module.css';

// Step 1 form: avatar, banner, bio, real name
// UI only — nothing is uploaded or saved yet
export default function BioAccountStep({ nextHref }) {
  return (
    <form className={styles.form}>
      <div className={styles.media}>
        {/* TODO(backend): show the uploaded avatar instead of initials */}
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
        />
        <p className={styles.hint}>Up to 160 characters</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-real-name" className={styles.label}>Real name</label>
        <input id="setup-real-name" className={styles.input} placeholder="Kaden A." required />
      </div>

      <Link href={nextHref} className={`${styles.button} ${styles.purple}`}>Continue</Link>
    </form>
  );
}
