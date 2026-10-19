import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import styles from './comingSoon.module.css';

// Stand-in for pages owned by other stories so the nav links have somewhere to go.
// Delete the matching page.jsx once the real page is built.
export default function ComingSoon({ title, story }) {
  return (
    <section className={styles.placeholder}>
      <div className={styles.icon}><Construction size={26} /></div>
      <p className={styles.eyebrow}>{story.toUpperCase()}</p>
      <h1 className={styles.title}>{title} is on the way</h1>
      <p className={styles.text}>This page is still being built. Head back to your feed in the meantime.</p>
      <Link href="/home" className={styles.button}><ArrowLeft size={16} /> Back to home</Link>
    </section>
  );
}
