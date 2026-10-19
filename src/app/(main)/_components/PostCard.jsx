'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, MoreHorizontal, Send } from 'lucide-react';
import { CURRENT_USER_HANDLE, getPlayer } from '../_data/mockPlayers';
import styles from '../main.module.css';

export default function PostCard({ post }) {
  const author = getPlayer(post.authorHandle);
  const [liked, setLiked] = useState(false);
  // own posts link back to /profile instead of /players/<me>
  const authorHref = author.handle === CURRENT_USER_HANDLE ? '/profile' : `/players/${author.handle}`;

  return (
    <article className={`${styles.panel} ${styles.post}`}>
      <header className={styles.postHeader}>
        <Link href={authorHref} className={styles.postAuthor}>
          <span className={`${styles.avatar} ${styles.avatarMd}`}>
            {author.initials}
            {author.online && <span className={styles.onlineDot} />}
          </span>
          <span>
            <span className={styles.postName}>{author.gamertag}</span>
            <span className={styles.postMeta}>{author.school} · {author.role} · {post.time}</span>
          </span>
        </Link>
        {/* TODO: report / hide menu */}
        <button type="button" className={styles.iconButton} aria-label="More options">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <p className={styles.postBody}>{post.body}</p>
      {post.image && <img src={post.image} alt="" className={styles.postImage} />}

      <div className={styles.postStats}>
        <span className={styles.likes}><Heart size={14} fill="currentColor" /> {post.likes + (liked ? 1 : 0)}</span>
        <span>{post.comments} comments · {post.shares} shares</span>
      </div>

      {/* TODO(backend): like / comment / share endpoints. Like is local only for now */}
      <div className={styles.postActions}>
        <button
          type="button"
          className={`${styles.postAction} ${liked ? styles.postActionOn : ''}`}
          onClick={() => setLiked(!liked)}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> Like
        </button>
        <button type="button" className={styles.postAction}><MessageSquare size={18} /> Comment</button>
        <button type="button" className={styles.postAction}><Send size={18} /> Share</button>
      </div>
    </article>
  );
}
