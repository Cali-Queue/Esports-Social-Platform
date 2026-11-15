import Link from 'next/link';
import styles from './discover.module.css';

export default function PlayerCard({ player }) {
  const initials = player.gamertag.slice(0, 2).toUpperCase();

  return (
    <li className={styles.playerCard}>
      <span className={styles.playerAvatar} aria-hidden="true">
        {initials}
      </span>

      <div className={styles.playerInfo}>
        <div className={styles.playerHeading}>
          <h3>{player.gamertag}</h3>

          {player.looking_for_team && (
            <span className={styles.availabilityBadge}>
              Looking for team
            </span>
          )}
        </div>

        <p className={styles.playerSchool}>{player.school}</p>

        <div className={styles.playerBadges}>
          {/* the and ensures that only truthy values will be created */}
          {player.game && (
            <span className={styles.gameBadge}>{player.game}</span>
          )}

          {player.role && (
            <span className={styles.roleBadge}>{player.role}</span>
          )}
        </div>
      </div>

      <Link
        href={`/players/${encodeURIComponent(player.handle)}`}
        className={styles.viewLink}
        aria-label={`View ${player.gamertag}'s profile`}
      >
        View
      </Link>
    </li>
  );
}