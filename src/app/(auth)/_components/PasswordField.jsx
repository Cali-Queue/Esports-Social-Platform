'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../auth.module.css';

// Same as TextField but with the show/hide toggle.
// labelAside is for stuff like the "Forgot password?" link on the login page.
export default function PasswordField({ id, label, labelAside, hint, error, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const hintId = `${id}-hint`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        <span>{label}</span>
        {labelAside}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          className={styles.input}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? hintId : undefined}
          {...inputProps}
        />
        <button
          className={styles.visibilityButton}
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {/* error replaces the hint instead of stacking under it */}
      {error ? (
        <p id={hintId} className={styles.error} role="alert">{error}</p>
      ) : (
        hint && <p id={hintId} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}
