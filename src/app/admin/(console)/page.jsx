'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAdmin } from '../_components/AdminProvider';
import { Avatar, RoleBadge, StatCard, StatusBadge, UserDetails, UserMenu } from '../_components/ui';
import { PLATFORM_STATS as S, formatDate, formatNumber, initials } from '../_data/adminData';
import styles from '../admin.module.css';

const PREVIEW_ROWS = 4;

function matches(user, query) {
  const q = query.trim().toLowerCase();
  return !q || [user.username, user.email, user.school].some((field) => field.toLowerCase().includes(q));
}

// Builds a CSV of the sample directory in the browser and downloads it.
// TODO(backend): replace with a real report export.
function exportReport(users) {
  const header = ['Username', 'Email', 'School', 'Role', 'Status', 'Member since'];
  const rows = users.map((u) => [u.username, u.email, u.school, u.role, u.status, u.memberSince]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cali-queue-users-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboardPage() {
  const { users, pendingCount } = useAdmin();
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);

  const results = users.filter((u) => matches(u, query));
  const activeShare = ((S.activeThisWeek / S.totalUsers) * 100).toFixed(1);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Platform Overview</h1>
          <p className={styles.small}>{today} · live operations</p>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => exportReport(users)}>Export report</button>
      </header>

      <section className={styles.stats} aria-label="Platform metrics">
        <StatCard label="Total users" value={formatNumber(S.totalUsers)} note={S.totalUsersChange} />
        <StatCard label="Active this week" value={formatNumber(S.activeThisWeek)} note={`${activeShare}% of members`} />
        <StatCard label="Open reports" value={S.openReports} note={S.openReportsChange} />
        <StatCard label="Inactive 180d+" value={S.inactive180} note="30-day notice window" tone="red" />
      </section>

      <div className={styles.dashGrid}>
        <section className={styles.panel} aria-labelledby="dash-users">
          <div className={styles.panelHead}>
            <h2 id="dash-users" className={styles.panelTitle}>Searchable users</h2>
            <label className={styles.searchSm}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Search user, email, school"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users"
              />
            </label>
          </div>

          <ul className={styles.userList}>
            {results.slice(0, PREVIEW_ROWS).map((user) => (
              <li key={user.id} className={styles.userItem}>
                <button type="button" className={styles.userItemMain} onClick={() => setViewing(user.id)}>
                  <Avatar label={initials(user.username)} color={user.color} />
                  <span className={styles.userItemName}>
                    <strong>{user.username}</strong>
                    <span>Joined {formatDate(user.memberSince)}</span>
                  </span>
                  <span className={styles.userItemSchool}>{user.school}</span>
                </button>
                <StatusBadge user={user} />
                <RoleBadge role={user.role} />
                <UserMenu user={user} onView={(u) => setViewing(u.id)} />
              </li>
            ))}
            {results.length === 0 && <li className={styles.empty}>No users match “{query}”.</li>}
          </ul>

          <div className={styles.panelFoot}>
            <span className={styles.small}>
              {results.length > PREVIEW_ROWS ? `Showing ${PREVIEW_ROWS} of ${results.length} matches` : `${results.length} match${results.length === 1 ? '' : 'es'}`}
            </span>
            <Link href={query.trim() ? `/admin/users?q=${encodeURIComponent(query.trim())}` : '/admin/users'} className={styles.textLink}>
              Open member directory →
            </Link>
          </div>
        </section>

        <div className={styles.sideCards}>
          <section className={styles.panel}>
            <span className={`${styles.chip} ${styles.chipRed}`}>DELETION REVIEW</span>
            <h2 className={styles.bigTitle}>{S.inactive180} inactive accounts</h2>
            <p className={styles.small}>180+ days inactive enters a 30-day notice period.</p>
            <Link href="/admin/users?status=inactive" className={`${styles.btn} ${styles.btnRed}`}>Review queue</Link>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.bigTitle}>{pendingCount} pending</h2>
            <p className={styles.small}>Wiki edits, new pages, and team join requests.</p>
            <Link href="/admin/wiki-approvals" className={`${styles.btn} ${styles.btnSecondary}`}>Review approvals</Link>
          </section>
        </div>
      </div>

      {viewing && <UserDetails userId={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
