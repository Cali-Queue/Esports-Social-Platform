import styles from '../auth.module.css';

// Label + input + hint/error text. Any extra props get passed to the <input>.
export default function TextField({ id, label, hint, error, ...inputProps }) {
  const hintId = `${id}-hint`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        <span>{label}</span>
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? hintId : undefined}
        {...inputProps}
      />
      {error ? (
        <p id={hintId} className={styles.error} role="alert">{error}</p>
      ) : (
        hint && <p id={hintId} className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}
