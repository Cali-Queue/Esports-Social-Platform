'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, UserPlus, X } from 'lucide-react';
import { useFriendRequests } from '../_components/FriendRequestsProvider';
import { getPlayer } from '../_data/mockPlayers';
import { timeAgo } from '../_data/friendRequests';
import styles from './notifications.module.css';

// Notifications tab. Only friend requests for now (ESP-29).
export default function NotificationsPage() {
  const { ready, requests, incoming, outgoing, accept, decline, cancel } = useFriendRequests();
  const [tab, setTab] = useState('received');
  // requests answered on this visit stay on screen with a confirmation
  const [answered, setAnswered] = useState([]);

  const received = requests.filter(
    (r) => incoming.includes(r) || (answered.includes(r.id) && r.status !== 'pending'),
  );
  const tabs = [
    { id: 'received', label: 'Friend requests', count: incoming.length },
    { id: 'sent', label: 'Sent', count: outgoing.length },
  ];

  function answer(id, action) {
    action(id);
    setAnswered([...answered, id]);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerIcon}><Bell size={20} /></span>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            {incoming.length
              ? `You have ${incoming.length} pending friend ${incoming.length === 1 ? 'request' : 'requests'}.`
              : 'You’re all caught up.'}
          </p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Notifications">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            {count > 0 && <span className={styles.count}>{count}</span>}
          </button>
        ))}
      </div>

      {!ready ? null : tab === 'received' ? (
        received.length === 0 ? (
          <Empty title="No pending friend requests" text="When another student sends you a request, it shows up here." />
        ) : (
          <ul className={styles.list}>
            {received.map((request) => (
              <RequestRow key={request.id} handle={request.from} time={request.createdAt}>
                {request.status === 'pending' && (
                  <>
                    <button type="button" className={styles.accept} onClick={() => answer(request.id, accept)}>
                      <Check size={16} /> Accept
                    </button>
                    <button type="button" className={styles.decline} onClick={() => answer(request.id, decline)}>
                      <X size={16} /> Decline
                    </button>
                  </>
                )}
                {request.status === 'accepted' && (
                  <>
                    <span className={styles.done}>You’re now friends</span>
                    <Link href={`/messages?to=${request.from}`} className={styles.decline}>Message</Link>
                  </>
                )}
                {request.status === 'declined' && <span className={styles.doneMuted}>Request declined</span>}
              </RequestRow>
            ))}
          </ul>
        )
      ) : outgoing.length === 0 ? (
        <Empty title="No sent requests" text="Visit a student’s profile and press Add friend to send one." />
      ) : (
        <ul className={styles.list}>
          {outgoing.map((request) => (
            <RequestRow key={request.id} handle={request.to} time={request.createdAt} sent>
              <span className={styles.pending}><Clock size={14} /> Pending</span>
              <button type="button" className={styles.decline} onClick={() => cancel(request.id)}>
                Cancel
              </button>
            </RequestRow>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestRow({ handle, time, sent = false, children }) {
  const player = getPlayer(handle);
  const name = player?.gamertag ?? handle;

  return (
    <li className={styles.row}>
      <span className={styles.avatar}>{player?.initials ?? handle.slice(0, 2).toUpperCase()}</span>
      <div className={styles.rowText}>
        <p className={styles.rowTitle}>
          {player ? <Link href={`/players/${handle}`} className={styles.name}>{name}</Link> : <strong>{name}</strong>}
          {sent ? ' hasn’t answered your friend request yet' : ' sent you a friend request'}
        </p>
        <p className={styles.rowMeta}>
          {player && `${player.school} · ${player.game} ${player.position} · `}
          {timeAgo(time)}
        </p>
      </div>
      <div className={styles.rowActions}>{children}</div>
    </li>
  );
}

function Empty({ title, text }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}><UserPlus size={22} /></span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyText}>{text}</p>
      <Link href="/discover" className={styles.accept}>Find players</Link>
    </div>
  );
}
