import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import styles from '../setup.module.css';

// TODO(backend): load games from the server
const games = ['Valorant', 'League of Legends', 'Overwatch 2', 'Rocket League', 'Super Smash Bros. Ultimate'];

// Step 3 form: team and game.
// UI only — nothing is saved yet.
export default function TeamGamesStep({ nextHref }) {
  return (
    <form className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="setup-team" className={styles.label}>Current team</label>
        <input id="setup-team" className={styles.input} placeholder="Sac State Gold" />
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-game" className={styles.label}>Game</label>
        <div className={styles.selectWrap}>
          <select id="setup-game" className={`${styles.input} ${styles.select}`} defaultValue="" required>
            <option value="" disabled>Select game</option>
            {games.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
      </div>

      <Link href={nextHref} className={`${styles.button} ${styles.purple}`}>Continue</Link>
    </form>
  );
}
