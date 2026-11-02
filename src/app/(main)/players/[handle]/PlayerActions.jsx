'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, UserCheck, UserPlus } from 'lucide-react';
import { useFollows } from '../../_components/FollowProvider';
import styles from '../../main.module.css';

// Follow is shared with the home feed through FollowProvider. Add friend is local state for now.
// TODO(backend): POST friend request, and load the initial state from the API
export default function PlayerActions({ handle }) {
  const { isFollowing, toggleFollow } = useFollows();
  const following = isFollowing(handle);
  const [requested, setRequested] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => toggleFollow(handle)}
        aria-pressed={following}
      >
        {following && <Check size={16} />}
        {following ? 'Followed' : 'Follow'}
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnSecondary}`}
        onClick={() => setRequested(!requested)}
        aria-pressed={requested}
      >
        {requested ? <UserCheck size={16} /> : <UserPlus size={16} />}
        {requested ? 'Request sent' : 'Add friend'}
      </button>
      <Link href={`/messages?to=${handle}`} className={`${styles.btn} ${styles.btnOutline}`}>
        Message
      </Link>
    </>
  );
}
