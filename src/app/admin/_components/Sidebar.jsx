'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileCheck, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { ADMIN_ME } from '../_data/adminData';
import { useAdmin } from './AdminProvider';
import styles from '../admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/wiki-approvals', label: 'Wiki Approvals', icon: FileCheck, badge: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { pendingCount } = useAdmin();

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.sideBrand}>
        <span className={styles.logo}>CCE</span>
        <span>California Collegiate Esports · ADMIN</span>
      </Link>

      <div className={styles.chips}>
        <span className={`${styles.chip} ${styles.chipOrange}`}>STAFF</span>
        <span className={`${styles.chip} ${styles.chipPurple}`}>PLATFORM MOD</span>
      </div>

      <nav className={styles.sideNav} aria-label="Admin">
        {LINKS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.sideLink} ${active ? styles.sideLinkActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={17} />
              <span>{label}</span>
              {badge && pendingCount > 0 && <span className={styles.sideBadge}>{pendingCount}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.meCard}>
        <div className={styles.meRow}>
          <span className={styles.avatar} style={{ width: 36, height: 36, fontSize: 12 }}>{ADMIN_ME.initials}</span>
          <div className={styles.meText}>
            <strong>{ADMIN_ME.name}</strong>
            <span>{ADMIN_ME.title}</span>
          </div>
          <Link href="/admin/login" className={styles.iconButton} aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
          </Link>
        </div>
        <span className={styles.live}><span className={styles.liveDot} />Live operations</span>
      </div>
    </aside>
  );
}
