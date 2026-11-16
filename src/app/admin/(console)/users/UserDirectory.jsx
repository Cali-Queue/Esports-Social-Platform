'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAdmin } from '../../_components/AdminProvider';
import { Avatar, RoleBadge, StatCard, StatusBadge, UserDetails, UserMenu } from '../../_components/ui';
import Pagination, { SortHeader } from '../../_components/Pagination';
import { PLATFORM_STATS as S, ROLES, formatDate, formatNumber, initials } from '../../_data/adminData';
import styles from '../../admin.module.css';

const PAGE_SIZE = 7;
const STATUSES = [
  ['all', 'All'],
  ['active', 'Active'],
  ['review', 'Review'],
  ['inactive', 'Inactive'],
  ['suspended', 'Suspended'],
];

export default function UserDirectory({ initialQuery, initialStatus }) {
  const { users } = useAdmin();
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState(STATUSES.some(([v]) => v === initialStatus) ? initialStatus : 'all');
  const [sort, setSort] = useState({ key: 'username', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  const q = query.trim().toLowerCase();
  const filtered = users
    .filter((u) => !q || [u.username, u.email, u.school].some((f) => f.toLowerCase().includes(q)))
    .filter((u) => role === 'all' || u.role === role)
    .filter((u) => status === 'all' || u.status === status)
    .sort((a, b) => {
      const result = sort.key === 'memberSince'
        ? a.memberSince.localeCompare(b.memberSince)
        : a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
      return sort.dir === 'asc' ? result : -result;
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const first = filtered.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const last = (current - 1) * PAGE_SIZE + rows.length;

  // any filter change goes back to page 1
  function withReset(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleSort(key) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  }

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.muted}>Manage members, roles, account health, and access across the network.</p>
        </div>
      </header>

      <section className={styles.stats} aria-label="User metrics">
        <StatCard label="Total users" value={formatNumber(S.totalUsers)} note={S.totalUsersChange} />
        <StatCard label="Active this week" value={formatNumber(S.activeThisWeek)} note={`${((S.activeThisWeek / S.totalUsers) * 100).toFixed(1)}% of members`} />
        <StatCard label="Needs review" value={S.needsReviewIdentity + S.needsReviewSchool} note={`${S.needsReviewIdentity} identity · ${S.needsReviewSchool} school`} tone="orange" />
        <StatCard label="Inactive 180d+" value={S.inactive180} note="30-day notice window" tone="red" />
      </section>

      <section className={styles.panel} aria-labelledby="directory-title">
        <div className={styles.panelHead}>
          <div>
            <h2 id="directory-title" className={styles.panelTitle}>Member directory</h2>
            <p className={styles.small}>Verified people with platform access</p>
          </div>
          <span className={styles.small}>Updated 2 min ago</span>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={17} />
            <input
              type="search"
              placeholder="Search username, email, school"
              value={query}
              onChange={(e) => withReset(setQuery)(e.target.value)}
              aria-label="Search users"
            />
          </label>
          <label className={styles.selectWrap}>
            <span>Role:</span>
            <select value={role} onChange={(e) => withReset(setRole)(e.target.value)} aria-label="Filter by role">
              <option value="all">All</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className={styles.selectWrap}>
            <span>Status:</span>
            <select value={status} onChange={(e) => withReset(setStatus)(e.target.value)} aria-label="Filter by status">
              {STATUSES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </label>
          <span className={styles.countPill}>{filtered.length} user{filtered.length === 1 ? '' : 's'}</span>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">PFP</th>
                <SortHeader label="Username" column="username" sort={sort} onSort={toggleSort} />
                <SortHeader label="Member since" column="memberSince" sort={sort} onSort={toggleSort} />
                <th scope="col">School</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col"><span className={styles.srOnly}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td><Avatar label={initials(user.username)} color={user.color} size={46} /></td>
                  <td>
                    <button type="button" className={styles.nameButton} onClick={() => setViewing(user.id)}>
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </button>
                  </td>
                  <td>{formatDate(user.memberSince)}</td>
                  <td>{user.school}</td>
                  <td><RoleBadge role={user.role} /></td>
                  <td><StatusBadge user={user} /></td>
                  <td><UserMenu user={user} onView={(u) => setViewing(u.id)} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>No users match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panelFoot}>
          <span className={styles.small}>Showing {first}–{last} of {filtered.length} users</span>
          <Pagination page={current} pageCount={pageCount} onChange={setPage} />
        </div>
      </section>

      {viewing && <UserDetails userId={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
