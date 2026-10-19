import Link from 'next/link';
import { Pencil } from 'lucide-react';
import ProfileView from '../_components/ProfileView';
import { CURRENT_USER_HANDLE, getPlayer, players } from '../_data/mockPlayers';
import styles from '../main.module.css';

export const metadata = { title: 'My profile · Cali Queue' };

// The logged-in user's own profile. Same layout as /players/[handle],
// but with Edit instead of Follow / Add friend / Message.
export default function MyProfilePage() {
  // TODO(backend): get the logged-in user from the session instead of mock data
  const me = getPlayer(CURRENT_USER_HANDLE);
  // TODO(backend): real suggestions endpoint
  const suggested = Object.values(players).filter((p) => p.handle !== me.handle);

  return (
    <ProfileView
      player={me}
      isOwner
      sidebarExtra={
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Players you may know</h3>
          <ul className={styles.suggestions}>
            {suggested.map((p) => (
              <li key={p.handle} className={styles.suggestion}>
                <span className={`${styles.avatar} ${styles.avatarMd}`}>{p.initials}</span>
                <span className={styles.suggestionText}>
                  <strong>{p.gamertag}</strong>
                  <span>{p.school} · {p.position}</span>
                </span>
                <Link href={`/players/${p.handle}`} className={`${styles.btn} ${styles.btnTealOutline} ${styles.btnSm}`}>
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>
      }
      actions={
        // TODO: /setup is the "Make your player page recruitable" flow from the Figma (not built yet)
        <Link href="/setup" className={`${styles.btn} ${styles.btnPrimary}`}>
          <Pencil size={16} /> Edit profile
        </Link>
      }
    />
  );
}
