'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { formatDate, initials } from '../_data/adminData';
import { useAdmin } from './AdminProvider';
import styles from '../admin.module.css';

export function Avatar({ label, color, size = 40 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.36, background: color }} aria-hidden="true">
      {label}
    </span>
  );
}

export function StatCard({ label, value, note, tone = 'teal' }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
      <span className={`${styles.statNote} ${styles[tone]}`}>{note}</span>
    </div>
  );
}

export function StatusBadge({ user }) {
  if (user.status === 'active') return <span className={`${styles.pill} ${styles.pillTeal}`}>Active</span>;
  if (user.status === 'review') return <span className={`${styles.pill} ${styles.pillOrange}`}>Review</span>;
  if (user.status === 'suspended') return <span className={`${styles.pill} ${styles.pillGray}`}>Suspended</span>;
  return (
    <span className={`${styles.pill} ${styles.pillRed}`}>
      {user.noticeSent ? 'Notice sent' : `Inactive ${user.inactiveDays}d`}
    </span>
  );
}

export function RoleBadge({ role }) {
  return <span className={`${styles.pill} ${styles.pillDark}`}>{role}</span>;
}

// Closes on Escape or a click on the dimmed background.
export function Modal({ title, onClose, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // runs once: focus the dialog, close on Escape, give focus back when it closes
  useEffect(() => {
    const opener = document.activeElement;
    function onKey(event) {
      if (event.key === 'Escape') closeRef.current();
    }
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, []);

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={panelRef}>
        <div className={styles.modalHead}>
          <h2 id="modal-title">{title}</h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// The "•••" menu on each user row. Which actions show depends on the user's status.
export function UserMenu({ user, onView }) {
  const { clearReview, suspend, reactivate, sendNotice } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event) {
      if (!ref.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function run(action) {
    action(user.id);
    setOpen(false);
  }

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button
        type="button"
        className={styles.moreButton}
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${user.username}`}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onView(user); }}>View details</button>
          {user.status === 'review' && <button type="button" role="menuitem" onClick={() => run(clearReview)}>Approve review</button>}
          {user.status === 'inactive' && !user.noticeSent && <button type="button" role="menuitem" onClick={() => run(sendNotice)}>Send 30-day notice</button>}
          {user.status === 'suspended' || user.status === 'inactive' ? (
            <button type="button" role="menuitem" onClick={() => run(reactivate)}>Reactivate</button>
          ) : (
            <button type="button" role="menuitem" className={styles.danger} onClick={() => run(suspend)}>Suspend</button>
          )}
        </div>
      )}
    </div>
  );
}

export function UserDetails({ userId, onClose }) {
  const { users, clearReview, suspend, reactivate, sendNotice } = useAdmin();
  // read the live copy so the dialog updates after an action
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const rows = [
    ['Email', user.email],
    ['School', user.school],
    ['Role', user.role],
    ['Member since', formatDate(user.memberSince)],
    ['Last active', user.lastActive],
    ['Team', user.team || 'No team'],
    ['Games', user.games.join(', ')],
    ['Open reports', user.reports],
  ];

  return (
    <Modal title="User details" onClose={onClose}>
      <div className={styles.detailHead}>
        <Avatar label={initials(user.username)} color={user.color} size={56} />
        <div>
          <strong className={styles.detailName}>{user.username}</strong>
          <div className={styles.detailBadges}>
            <RoleBadge role={user.role} />
            <StatusBadge user={user} />
          </div>
        </div>
      </div>

      {user.status === 'review' && user.reviewReason && <p className={styles.callout}>{user.reviewReason}</p>}

      <dl className={styles.detailList}>
        {rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.modalActions}>
        {user.status === 'review' && <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => clearReview(user.id)}>Approve review</button>}
        {user.status === 'inactive' && !user.noticeSent && <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => sendNotice(user.id)}>Send 30-day notice</button>}
        {user.status === 'suspended' || user.status === 'inactive' ? (
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => reactivate(user.id)}>Reactivate</button>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.btnRed}`} onClick={() => suspend(user.id)}>Suspend</button>
        )}
      </div>
    </Modal>
  );
}
