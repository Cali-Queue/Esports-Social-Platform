"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./teams.module.css";

// href: null means the tab isn't built yet.
const tabs = [
  { label: "Overview", href: "/teams" },
  { label: "Teams & games", href: "/teams/games" },
  { label: "Rosters", href: "/teams/rosters" },
  { label: "Events & news", href: null },
  { label: "School Wiki", href: "/teams/wiki" },
];

export default function SchoolTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabs}>
      {tabs.map((tab) =>
        tab.href ? (
          <Link
            key={tab.label}
            href={tab.href}
            className={pathname === tab.href ? styles.activeTab : undefined}
          >
            {tab.label}
          </Link>
        ) : (
          <span key={tab.label} className={styles.tabDisabled} title="Coming soon">
            {tab.label}
          </span>
        )
      )}
    </nav>
  );
}