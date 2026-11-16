'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import styles from '../admin.module.css';

export default function Pagination({ page, pageCount, onChange }) {
  return (
    <nav className={styles.pagination} aria-label="Pages">
      <button type="button" className={styles.pageButton} onClick={() => onChange(page - 1)} disabled={page <= 1}>Previous</button>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.pageNumber} ${n === page ? styles.pageNumberActive : ''}`}
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </button>
      ))}
      <button type="button" className={styles.pageButton} onClick={() => onChange(page + 1)} disabled={page >= pageCount}>Next</button>
    </nav>
  );
}

// A table header button that sorts by its column; clicking again flips the direction.
export function SortHeader({ label, column, sort, onSort }) {
  const active = sort.key === column;
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className={styles.sortButton} onClick={() => onSort(column)}>
        {label} <Icon size={13} />
      </button>
    </th>
  );
}
