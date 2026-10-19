'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Compass, House, LogOut, Map as MapIcon, MessageCircle, Search, UserRound } from 'lucide-react';
import { CURRENT_USER_HANDLE, getPlayer } from '../_data/mockPlayers';
import styles from '../main.module.css';

// TODO: feed, discover, map, messages and notifications pages don't exist yet,
// these links will 404 until those tickets are done
const LINKS = [
  { href: '/feed', label: 'Home Feed', icon: House },
  { href: '/discover', label: 'Discover', icon: Compass, match: ['/discover', '/players'] },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function NavBar() {
  const pathname = usePathname();
  const me = getPlayer(CURRENT_USER_HANDLE);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // close the account menu when clicking anywhere else
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // close it after navigating too
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className={styles.nav}>
      <Link href="/feed" className={styles.brand}>
        <span className={styles.logo}>CCE</span>
        <span className={styles.brandName}>California Collegiate Esports</span>
      </Link>

      <nav className={styles.navLinks} aria-label="Main">
        {LINKS.map(({ href, label, icon: Icon, match = [href] }) => {
          const active = match.some((path) => pathname.startsWith(path));
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.navRight}>
        <label className={styles.search}>
          <Search size={17} />
          {/* TODO(backend): hook up to search endpoint */}
          <input type="search" placeholder="Players, teams, schools" aria-label="Search players, teams, schools" />
        </label>

        <div className={styles.account} ref={menuRef}>
          <button
            type="button"
            className={styles.accountButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <span className={`${styles.avatar} ${styles.avatarSm}`}>
              {me.initials}
              <span className={styles.onlineDot} />
            </span>
            <ChevronDown size={16} className={menuOpen ? styles.chevronOpen : ''} />
          </button>

          {menuOpen && (
            <div className={styles.menu} role="menu">
              <div className={styles.menuHeader}>
                <strong>{me.gamertag}</strong>
                <span>{me.school}</span>
              </div>
              <Link href="/profile" className={styles.menuItem} role="menuitem">
                <UserRound size={16} /> View profile
              </Link>
              <Link href="/logout" className={styles.menuItem} role="menuitem">
                <LogOut size={16} /> Log out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
