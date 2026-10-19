import { EyeOff, Lock } from 'lucide-react';
import PostCard from './PostCard';
import styles from '../main.module.css';

// Layout shared by /profile (your own) and /players/[handle] (someone else).
// The only differences are the buttons passed in as `actions` and the
// real-name / privacy text, which depends on `isOwner`.
export default function ProfileView({ player, actions, isOwner = false, sidebarExtra }) {
  return (
    <div className={styles.profile}>
      <div className={styles.banner} style={{ backgroundImage: `url(${player.banner})` }} />
      {/* sits on the banner on desktop, moves under the name on mobile (see css) */}
      <div className={styles.bannerActions}>{actions}</div>

      <div className={styles.profileGrid}>
        {/* left column: identity */}
        <aside className={styles.identity}>
          <span className={`${styles.avatar} ${styles.avatarXl}`}>
            {player.initials}
            {player.online && <span className={styles.onlineDot} />}
          </span>

          <h1 className={styles.gamertag}>
            {player.gamertag}
            <span className={styles.roleBadge}>{player.role}</span>
          </h1>

          {isOwner ? (
            <p className={styles.realName}>
              <Lock size={12} /> {player.realName} · only visible to you
            </p>
          ) : (
            !player.showRealName && <p className={styles.realName}><EyeOff size={12} /> Real name hidden by player</p>
          )}

          <p className={styles.schoolLine}>{player.school} · {player.team}</p>

          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.tagPurple}`}>{player.game}</span>
            <span className={styles.tag}>{player.position}</span>
            <span className={`${styles.tag} ${styles.tagOrange}`}>{player.rank}</span>
            {player.lookingForTeam && <span className={`${styles.tag} ${styles.tagTeal}`}>Looking for team</span>}
          </div>

          <p className={styles.bio}>{player.bio}</p>

          <dl className={`${styles.panel} ${styles.facts}`}>
            <div><dt>Main role</dt><dd>{player.position}</dd></div>
            <div><dt>Peak rank</dt><dd>{player.peakRank}</dd></div>
            <div><dt>Pronouns</dt><dd>{player.pronouns}</dd></div>
          </dl>

          <p className={styles.counts}>
            <strong>{player.followers.toLocaleString()}</strong> followers
            <span aria-hidden="true"> · </span>
            <strong>{player.friends}</strong> friends
          </p>
        </aside>

        {/* middle column: overview */}
        <section className={styles.overview} aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={styles.tabTitle}>Overview</h2>

          <div className={`${styles.panel} ${styles.timeline}`}>
            <h3 className={styles.panelTitle}>Achievements timeline</h3>
            <ul>
              {player.achievements.map((item) => (
                <li key={item.year + item.title}>
                  <span className={styles.timelineDot} />
                  <span className={styles.timelineYear}>{item.year}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {player.posts.map((post) => <PostCard key={post.id} post={post} />)}
          {player.posts.length === 0 && (
            <p className={`${styles.panel} ${styles.empty}`}>No posts yet.</p>
          )}
        </section>

        {/* right column: interests + trust */}
        <aside className={styles.sidebar}>
          <div className={`${styles.panel} ${styles.interests}`}>
            {player.interests.map((interest) => (
              <span key={interest} className={styles.chip}>{interest}</span>
            ))}
          </div>

          <p className={styles.privacy}>
            {isOwner
              ? 'Your profile is public to recruiters. Your real name stays private.'
              : 'Public to recruiters. Real name remains private.'}
          </p>

          <div className={`${styles.panel} ${styles.stat}`}>
            <strong>{player.endorsement}%</strong>
            <span>positive teammate endorsements</span>
          </div>

          {sidebarExtra}
        </aside>
      </div>
    </div>
  );
}
