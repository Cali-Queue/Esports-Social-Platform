'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flag, Heart, MessageSquare, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { CURRENT_USER_HANDLE, getPlayer } from '../_data/mockPlayers';
import styles from './home.module.css';

// Feed post card (Story 2.3). Likes are local only for now.
// TODO(backend): POST/DELETE /api/posts/:id/like, comments, report.
export default function HomePostCard({ post, onDelete }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likes, setLikes] = useState(post.likeCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reported, setReported] = useState(false);
  const { author } = post;
  // own posts link to /profile, players with a profile page link to it, others aren't linked yet
  let authorHref = null;
  if (author.handle === CURRENT_USER_HANDLE) authorHref = '/profile';
  else if (getPlayer(author.handle)) authorHref = `/players/${author.handle}`;

  function toggleLike() {
    setLikes(likes + (liked ? -1 : 1));
    setLiked(!liked);
  }

  return (
    <article className={styles.post}>
      <header className={styles.postHead}>
        <span className={`${styles.avatar} ${author.isTeam ? styles.avatarTeam : ''}`}>{author.initials}</span>
        <div className={styles.postAuthor}>
          {authorHref ? (
            <Link href={authorHref} className={styles.postName}>{author.displayName}</Link>
          ) : (
            <span className={styles.postName}>{author.displayName}</span>
          )}
          <span className={styles.postMeta}>{author.school} · {post.createdAt}</span>
        </div>
        {(author.role || author.isTeam) && (
          <span className={styles.postRole}>{author.isTeam ? 'Team' : author.role}</span>
        )}
        <div className={styles.postMenuWrap}>
          <button
            type="button"
            className={styles.iconGhost}
            aria-label="Post options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className={styles.postMenu}>
              {post.mine ? (
                <button type="button" onClick={() => { setConfirming(true); setMenuOpen(false); }}>
                  <Trash2 size={14} /> Delete post
                </button>
              ) : (
                <button type="button" onClick={() => { setReported(true); setMenuOpen(false); }} disabled={reported}>
                  <Flag size={14} /> {reported ? 'Reported' : 'Report post'}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <p className={styles.postText}>{post.text}</p>

      {post.media?.kind === 'scoreboard' && (
        <div className={styles.scoreboard}>
          <span className={styles.scoreLabel}>{post.media.label}</span>
          <div className={styles.scoreRow}>
            <span className={styles.scoreTeam}>{post.media.home}</span>
            <span className={styles.scoreValue}>{post.media.score}</span>
            <span className={styles.scoreTeam}>{post.media.away}</span>
          </div>
        </div>
      )}
      {post.media?.kind === 'image' && <img src={post.media.src} alt="" className={styles.postImage} />}
      {post.media?.kind === 'banner' && (
        <div className={styles.mediaBanner}>
          <span className={styles.mediaTitle}>{post.media.title}</span>
          <span className={styles.mediaSubtitle}>{post.media.subtitle}</span>
        </div>
      )}

      {post.game && <span className={styles.gameChip}>{post.game}</span>}

      {confirming ? (
        <div className={styles.confirm}>
          <span>Delete this post?</span>
          <button type="button" className={styles.ghostSmall} onClick={() => setConfirming(false)}>Cancel</button>
          <button type="button" className={styles.dangerSmall} onClick={() => onDelete(post.id)}>Delete</button>
        </div>
      ) : (
        <footer className={styles.postActions}>
          <button
            type="button"
            className={`${styles.action} ${liked ? styles.actionLiked : ''}`}
            aria-pressed={liked}
            onClick={toggleLike}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likes}
          </button>
          <button type="button" className={styles.action}>
            <MessageSquare size={16} /> {post.commentCount}
          </button>
          <button type="button" className={styles.action}>
            <Share2 size={16} /> Share
          </button>
        </footer>
      )}
    </article>
  );
}
