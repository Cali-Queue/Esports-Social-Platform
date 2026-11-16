'use client';

import { useState } from 'react';
import { Check, Search, Undo2, X } from 'lucide-react';
import { useAdmin } from '../../_components/AdminProvider';
import { Avatar, Modal, StatCard } from '../../_components/ui';
import Pagination, { SortHeader } from '../../_components/Pagination';
import { PLATFORM_STATS as S } from '../../_data/adminData';
import styles from '../../admin.module.css';

const PAGE_SIZE = 6;
const TYPES = ['Edit', 'New page', 'Join team'];
const STATUSES = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['denied', 'Denied'],
];

const TYPE_CLASS = { Edit: styles.pillDark, 'New page': styles.pillOrange, 'Join team': styles.pillPurple };

function ModerationGuide({ onClose }) {
  return (
    <Modal title="Moderation guide" onClose={onClose}>
      <ul className={styles.guideList}>
        <li><strong>Sourcing.</strong> Rosters, results and staff changes need a link to the school, league or an official social account.</li>
        <li><strong>School affiliation.</strong> The submitter should belong to the school, or the edit should be confirmed by that school's moderator.</li>
        <li><strong>Tone.</strong> Keep pages neutral and factual. Deny trash talk, rumors or self-promotion.</li>
        <li><strong>Duplication.</strong> Check that a new page doesn't already exist under another name before approving it.</li>
        <li><strong>Join requests.</strong> Approve only when the team captain or coach has confirmed the player.</li>
        <li><strong>Timing.</strong> Aim to decide every submission within 24 hours.</li>
      </ul>
      <div className={styles.modalActions}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose}>Got it</button>
      </div>
    </Modal>
  );
}

export default function WikiApprovalsPage() {
  const { submissions, pendingCount, approvedCount, approve, deny, undoDecision } = useAdmin();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortDir, setSortDir] = useState('asc'); // asc = newest first
  const [page, setPage] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = submissions
    .filter((s) => !q || [s.page, s.name, s.handle, s.school].some((f) => f.toLowerCase().includes(q)))
    .filter((s) => type === 'all' || s.type === type)
    .filter((s) => status === 'all' || s.status === status)
    .sort((a, b) => (sortDir === 'asc' ? a.minutesAgo - b.minutesAgo : b.minutesAgo - a.minutesAgo));

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const first = filtered.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const last = (current - 1) * PAGE_SIZE + rows.length;

  function withReset(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Wiki Approvals</h1>
          <p className={styles.muted}>Review wiki edits, new pages, and team join requests before they go live.</p>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setGuideOpen(true)}>Moderation guide</button>
      </header>

      <section className={styles.stats} aria-label="Approval metrics">
        <StatCard label="Pending review" value={pendingCount} note="4 submitted today" tone="orange" />
        <StatCard label="Oldest request" value={S.oldestRequest} note="Within 24h target" />
        <StatCard label="Approved this week" value={S.approvedThisWeek + approvedCount} note={`${S.acceptanceRate} acceptance rate`} />
        <StatCard label="Needs sources" value={S.needsSources} note="Citation follow-up" tone="red" />
      </section>

      <section className={styles.panel} aria-labelledby="pending-title">
        <div className={styles.panelHead}>
          <div>
            <h2 id="pending-title" className={styles.panelTitle}>
              Pending submissions
              {pendingCount > 0 && <span className={`${styles.chip} ${styles.chipOrange} ${styles.chipTiny}`}>ACTION REQUIRED</span>}
            </h2>
            <p className={styles.small}>Check sourcing, school affiliation, tone, and duplication before deciding.</p>
          </div>
          <span className={styles.small}>Target: review within 24 hours</span>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={17} />
            <input
              type="search"
              placeholder="Search page, submitter, school"
              value={query}
              onChange={(e) => withReset(setQuery)(e.target.value)}
              aria-label="Search submissions"
            />
          </label>
          <label className={styles.selectWrap}>
            <span>Type:</span>
            <select value={type} onChange={(e) => withReset(setType)(e.target.value)} aria-label="Filter by type">
              <option value="all">All</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className={styles.selectWrap}>
            <span>Status:</span>
            <select value={status} onChange={(e) => withReset(setStatus)(e.target.value)} aria-label="Filter by status">
              {STATUSES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </label>
          <span className={styles.countPill}>{pendingCount} pending</span>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">PFP</th>
                <th scope="col">Submitted by</th>
                <th scope="col">Wiki page</th>
                <th scope="col">School</th>
                <SortHeader
                  label="Submitted"
                  column="submitted"
                  sort={{ key: 'submitted', dir: sortDir }}
                  onSort={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                />
                <th scope="col">Type</th>
                <th scope="col">Decision</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={s.status !== 'pending' ? styles.decidedRow : undefined}>
                  <td><Avatar label={s.initials} color={s.color} size={46} /></td>
                  <td className={styles.stack}><strong>{s.name}</strong><span>@{s.handle}</span></td>
                  <td className={styles.stack}><strong>{s.page}</strong><span>{s.summary}</span></td>
                  <td>{s.school}</td>
                  <td className={styles.faintCell}>{s.submitted}</td>
                  <td><span className={`${styles.pill} ${TYPE_CLASS[s.type]}`}>{s.type}</span></td>
                  <td>
                    {s.status === 'pending' ? (
                      <div className={styles.decision}>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={() => approve(s.id)} aria-label={`Approve ${s.page}`}>
                          <Check size={15} /> Approve
                        </button>
                        <button type="button" className={`${styles.btn} ${styles.btnRed} ${styles.btnSm}`} onClick={() => deny(s.id)} aria-label={`Deny ${s.page}`}>
                          <X size={15} /> Deny
                        </button>
                      </div>
                    ) : (
                      <div className={styles.decision}>
                        <span className={`${styles.pill} ${s.status === 'approved' ? styles.pillTeal : styles.pillRed}`}>
                          {s.status === 'approved' ? 'Approved' : 'Denied'}
                        </span>
                        <button type="button" className={styles.undoButton} onClick={() => undoDecision(s.id)}>
                          <Undo2 size={14} /> Undo
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>No submissions match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panelFoot}>
          <span className={styles.small}>Showing {first}–{last} of {filtered.length} submissions</span>
          <Pagination page={current} pageCount={pageCount} onChange={setPage} />
        </div>
      </section>

      {guideOpen && <ModerationGuide onClose={() => setGuideOpen(false)} />}
    </>
  );
}
