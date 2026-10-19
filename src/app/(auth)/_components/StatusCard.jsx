import styles from '../auth.module.css';

// Used by check-inbox, email-verified and link-expired since they all have
// the same layout: icon, pill, title, some text, then buttons.

// purple is the default so it doesn't need extra classes
const TONES = {
  purple: { icon: '', pill: '' },
  green: { icon: styles.green, pill: styles.greenPill },
  red: { icon: styles.red, pill: styles.redPill },
};

export default function StatusCard({ icon: Icon, tone = 'purple', pill, title, children, actions }) {
  const t = TONES[tone];

  return (
    <section className={`${styles.card} ${styles.centered}`}>
      <div className={`${styles.iconBox} ${t.icon}`}><Icon size={26} /></div>
      <span className={`${styles.pill} ${t.pill}`}>{pill}</span>
      <h1 className={styles.title}>{title}</h1>
      {children}
      <div className={styles.actions}>{actions}</div>
    </section>
  );
}
