'use client';

import { useState } from 'react';
import { ImageIcon, Trophy, Video } from 'lucide-react';
import styles from '../home/home.module.css';

const MAX_LENGTH = 1000;

// Create post box at the top of the feed.
// TODO(backend): POST /api/posts with text + media (Story 2.4).
export default function Composer({ user, onPost }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const remaining = MAX_LENGTH - text.length;

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed) return;
    onPost(trimmed);
    setText('');
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.composerTop}>
        <span className={styles.avatar}>{user.initials}</span>
        <label htmlFor="composer" className={styles.srOnly}>Create a post</label>
        <textarea
          id="composer"
          className={styles.composerInput}
          placeholder="Share a clip, a win, or a scrim request..."
          rows={2}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className={styles.composerBar}>
        <div className={styles.composerTools}>
          <button type="button" className={styles.toolButton} title="Media upload coming soon"><ImageIcon size={16} /> Photo</button>
          <button type="button" className={styles.toolButton} title="Media upload coming soon"><Video size={16} /> Clip</button>
          <button type="button" className={styles.toolButton} title="Achievements coming soon"><Trophy size={16} /> Result</button>
        </div>
        <div className={styles.composerSubmit}>
          {text.length > MAX_LENGTH - 100 && <span className={styles.counter}>{remaining}</span>}
          <button type="submit" className={styles.primaryButton} disabled={!trimmed}>Post</button>
        </div>
      </div>
    </form>
  );
}
