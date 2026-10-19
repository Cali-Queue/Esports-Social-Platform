'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Calendar, Compass, Gamepad2, Map, MessageCircle, Users } from 'lucide-react';
import Composer from '../_components/Composer';
import HomePostCard from './HomePostCard';
import { CURRENT_USER_HANDLE, getPlayer, players } from '../_data/mockPlayers';
import { myTeams, posts as initialPosts, recruitingTeams, upcomingEvents } from '../_data/homeFeed';
import styles from './home.module.css';

const TABS = [
  { id: 'following', label: 'Following' },
  { id: 'foryou', label: 'For You' },
];

export default function HomePage() {
  // TODO(backend): get the logged-in user from the session instead of mock data
  const me = getPlayer(CURRENT_USER_HANDLE);
  // TODO(backend): real suggestions endpoint
  const suggested = Object.values(players).filter((p) => p.handle !== me.handle);

  const [tab, setTab] = useState('following');
  const [posts, setPosts] = useState(initialPosts);
  const [followed, setFollowed] = useState({});

  // TODO(backend): replace with GET /api/feed?tab=... (Story 2.2)
  const visible = posts.filter((post) => post.tab.includes(tab));

  function addPost(text) {
    const post = {
      id: `local-${Date.now()}`,
      tab: ['following', 'foryou'],
      author: { displayName: me.gamertag, handle: me.handle, initials: me.initials, school: me.school, role: me.role },
      text,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      createdAt: 'now',
      mine: true,
    };
    setPosts([post, ...posts]);
  }

  function deletePost(id) {
    setPosts(posts.filter((post) => post.id !== id));
  }

  return (
    <div className={styles.layout}>
      {/* Left column: who you are and where to go */}
      <aside className={styles.left}>
        <section className={styles.profileCard}>
          <div className={styles.profileBanner} style={{ backgroundImage: `url(${me.banner})` }} />
          <div className={styles.profileBody}>
            <span className={styles.profileAvatar}>{me.initials}</span>
            <Link href="/profile" className={styles.profileName}>{me.gamertag}</Link>
            <p className={styles.profileMeta}>{me.school} · {me.game} {me.position}</p>
            <span className={styles.roleBadge}>{me.role}</span>
            <dl className={styles.profileStats}>
              <div><dt>Followers</dt><dd>{me.followers}</dd></div>
              <div><dt>Friends</dt><dd>{me.friends}</dd></div>
              <div><dt>Endorsed</dt><dd>{me.endorsement}%</dd></div>
            </dl>
            <Link href="/profile" className={styles.outlineButton}>View profile</Link>
          </div>
        </section>

        <nav className={styles.panel} aria-label="Shortcuts">
          <h2 className={styles.panelTitle}>Shortcuts</h2>
          <Link href="/friends" className={styles.shortcut}><Users size={16} /> Friends</Link>
          <Link href="/messages" className={styles.shortcut}><MessageCircle size={16} /> Messages</Link>
          <Link href="/discover" className={styles.shortcut}><Compass size={16} /> Find a team</Link>
          <Link href="/map" className={styles.shortcut}><Map size={16} /> Campus map</Link>
          <Link href="/saved" className={styles.shortcut}><Bookmark size={16} /> Saved posts</Link>
        </nav>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Your teams</h2>
          {myTeams.map((team) => (
            <Link key={team.id} href="/teams" className={styles.teamRow}>
              <span className={styles.teamIcon}><Gamepad2 size={16} /></span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{team.name}</span>
                <span className={styles.rowMeta}>{team.game} · {team.role}</span>
              </span>
            </Link>
          ))}
        </section>
      </aside>

      {/* Center column: the feed */}
      <section className={styles.feed} aria-label="Feed">
        <Composer user={me} onPost={addPost} />

        <div className={styles.tabs} role="tablist" aria-label="Feed">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Your feed is quiet</p>
            <p className={styles.emptyText}>Follow players and teams to see their posts here.</p>
            <Link href="/discover" className={styles.primaryButton}>Go to Discover</Link>
          </div>
        ) : (
          visible.map((post) => <HomePostCard key={post.id} post={post} onDelete={deletePost} />)
        )}
      </section>

      {/* Right column: events and recommendations */}
      <aside className={styles.right}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Upcoming events</h2>
            <Link href="/schools" className={styles.panelLink}>See all</Link>
          </div>
          {upcomingEvents.map((event) => (
            <Link key={event.id} href="/schools" className={styles.eventRow}>
              <span className={styles.eventDate}>
                <span>{event.month}</span>
                <strong>{event.day}</strong>
              </span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{event.title}</span>
                <span className={styles.rowMeta}>{event.meta}</span>
              </span>
            </Link>
          ))}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Players to follow</h2>
            <Link href="/discover" className={styles.panelLink}>More</Link>
          </div>
          {suggested.map((player) => (
            <div key={player.handle} className={styles.personRow}>
              <span className={styles.avatar}>{player.initials}</span>
              <Link href={`/players/${player.handle}`} className={styles.rowText}>
                <span className={styles.rowTitle}>{player.gamertag}</span>
                <span className={styles.rowMeta}>{player.school} · {player.game}</span>
              </Link>
              <button
                type="button"
                className={followed[player.handle] ? styles.followingButton : styles.followButton}
                aria-pressed={!!followed[player.handle]}
                onClick={() => setFollowed({ ...followed, [player.handle]: !followed[player.handle] })}
              >
                {followed[player.handle] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Teams recruiting</h2>
            <Link href="/discover" className={styles.panelLink}>Browse</Link>
          </div>
          {recruitingTeams.map((team) => (
            <Link key={team.id} href="/discover" className={styles.teamRow}>
              <span className={`${styles.teamIcon} ${styles.teamIconTeal}`}><Calendar size={16} /></span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{team.name}</span>
                <span className={styles.rowMeta}>{team.meta}</span>
                <span className={styles.recruitTag}>{team.need}</span>
              </span>
            </Link>
          ))}
        </section>
      </aside>
    </div>
  );
}
