'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Clock, UserCheck, UserPlus } from 'lucide-react';
import { useFriendRequests } from '../../_components/FriendRequestsProvider';
import styles from '../../main.module.css';

// Follow only changes local state for now.
// TODO(backend): POST follow, and load the initial follow state from the API
export default function PlayerActions({ handle }) {
  const [following, setFollowing] = useState(false);
  const { ready, relationshipWith, sendRequest } = useFriendRequests();
  const status = relationshipWith(handle);

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={() => setFollowing(!following)}
        aria-pressed={following}
      >
        {following && <Check size={16} />}
        {following ? 'Followed' : 'Follow'}
      </button>
      <FriendButton ready={ready} status={status} onSend={() => sendRequest(handle)} />
      <Link href={`/messages?to=${handle}`} className={`${styles.btn} ${styles.btnOutline}`}>
        Message
      </Link>
    </>
  );
}

// a second request can't be sent while one is pending, in either direction
function FriendButton({ ready, status, onSend }) {
  const className = `${styles.btn} ${styles.btnSecondary}`;

  if (status === 'received') {
    return (
      <Link href="/notifications" className={className}>
        <UserPlus size={16} /> Respond to request
      </Link>
    );
  }
  if (status === 'sent') {
    return (
      <button type="button" className={className} disabled title="Waiting for them to respond">
        <Clock size={16} /> Request pending
      </button>
    );
  }
  if (status === 'friends') {
    return (
      <button type="button" className={className} disabled>
        <UserCheck size={16} /> Friends
      </button>
    );
  }
  return (
    <button type="button" className={className} onClick={onSend} disabled={!ready}>
      <UserPlus size={16} /> Add friend
    </button>
  );
}
