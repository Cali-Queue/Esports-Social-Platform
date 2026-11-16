"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./map.module.css";

// Outline of California, drawn in a 400 x 520 box.
const CA_PATH =
  "M27,20 L176,20 L176,173 L365,378 L366,383 L370,419 L363,460 L370,480 L363,494 " +
  "L278,503 L275,495 L268,469 L258,456 L250,449 L240,441 L233,441 L229,428 L201,415 " +
  "L187,408 L159,405 L146,358 L123,326 L109,296 L105,278 L87,234 L70,224 L45,176 L20,102 Z";

const GAMES = ["Valorant", "League of Legends", "Overwatch 2", "Rocket League"];

// Placeholder data for now. Later, this can come from the database.
// x / y = where the dot sits on the map. labelX / labelY = where its name tag sits.
// href = the school's page. Schools without a page yet use null.
const schools = [
  {
    id: "sac-state",
    name: "Sacramento State",
    initials: "SS",
    location: "Sacramento · 3.2 mi from downtown",
    x: 125, y: 193, labelX: 137, labelY: 178,
    teamCount: 3,
    games: ["Valorant", "Rocket League", "League of Legends"],
    recruiting: true,
    description: "School description goes here.",
    teams: [
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
    ],
    href: "/teams",
  },
  {
    id: "uc-davis",
    name: "UC Davis",
    initials: "UCD",
    location: "Davis",
    x: 109, y: 196, labelX: 116, labelY: 212,
    teamCount: 2,
    games: ["Valorant", "Overwatch 2"],
    recruiting: false,
    description: "School description goes here.",
    teams: [
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
    ],
    href: null,
  },
  {
    id: "sjsu",
    name: "San Jose State",
    initials: "SJ",
    location: "San Jose",
    x: 110, y: 258, labelX: 122, labelY: 258,
    teamCount: 2,
    games: ["League of Legends", "Valorant"],
    recruiting: true,
    description: "School description goes here.",
    teams: [
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
    ],
    href: null,
  },
  {
    id: "cal-poly",
    name: "Cal Poly",
    initials: "CP",
    location: "San Luis Obispo",
    x: 156, y: 360, labelX: 168, labelY: 360,
    teamCount: 1,
    games: ["Rocket League"],
    recruiting: false,
    description: "School description goes here.",
    teams: [{ name: "Team Name", game: "Game" }],
    href: null,
  },
  {
    id: "ucla",
    name: "UCLA",
    initials: "UCLA",
    location: "Los Angeles",
    x: 233, y: 424, labelX: 245, labelY: 412,
    teamCount: 3,
    games: ["Valorant", "Overwatch 2", "League of Legends"],
    recruiting: true,
    description: "School description goes here.",
    teams: [
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
    ],
    href: null,
  },
  {
    id: "uc-irvine",
    name: "UC Irvine",
    initials: "UCI",
    location: "Irvine",
    x: 256, y: 444, labelX: 268, labelY: 452,
    teamCount: 2,
    games: ["League of Legends", "Overwatch 2"],
    recruiting: false,
    description: "School description goes here.",
    teams: [
      { name: "Team Name", game: "Game" },
      { name: "Team Name", game: "Game" },
    ],
    href: null,
  },
];

export default function MapPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [recruitingOnly, setRecruitingOnly] = useState(false);

  const selected = schools.find((s) => s.id === selectedId);

  // A school shows on the map if it matches the search box and filters.
  function matches(school) {
    const text = search.trim().toLowerCase();
    const matchesSearch =
      text === "" ||
      school.name.toLowerCase().includes(text) ||
      school.location.toLowerCase().includes(text);
    const matchesGame = activeGame === null || school.games.includes(activeGame);
    const matchesRecruiting = !recruitingOnly || school.recruiting;
    return matchesSearch && matchesGame && matchesRecruiting;
  }

  // Pressing Enter in the search box selects the first matching school.
  function handleSearchKey(e) {
    if (e.key === "Enter") {
      const first = schools.find(matches);
      if (first) setSelectedId(first.id);
    }
  }

  function selectFromKeyboard(e, school) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedId(school.id);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ---------- Left panel: search and filters ---------- */}
        <aside className={styles.panel}>
          <h1 className={styles.title}>Explore the map</h1>

          <p className={styles.label}>Find a school</p>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              type="text"
              placeholder="Campus or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
            />
          </div>

          <p className={styles.label}>Games</p>
          <div className={styles.chipGroup}>
            {GAMES.map((game) => (
              <button
                key={game}
                className={`${styles.chip} ${activeGame === game ? styles.chipActive : ""}`}
                onClick={() => setActiveGame(activeGame === game ? null : game)}
              >
                {game}
              </button>
            ))}
          </div>

          <p className={styles.label}>Signals</p>
          <div className={styles.chipGroup}>
            <button
              className={`${styles.chip} ${recruitingOnly ? styles.chipTeal : ""}`}
              onClick={() => setRecruitingOnly(!recruitingOnly)}
            >
              Recruiting now
            </button>
            <span className={styles.chip}>Upcoming events · Any</span>
          </div>

          <div className={styles.infoCard}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            </svg>
            <span>School pages are wikis. School mods, Captains, and Coaches can submit edits.</span>
          </div>
        </aside>

        {/* ---------- Center: the map ---------- */}
        <section className={`${styles.panel} ${styles.mapPanel}`}>
          <svg viewBox="0 0 400 520" className={styles.mapSvg} role="img" aria-label="Map of California schools">
            <path d={CA_PATH} className={styles.state} />

            {schools.map((school) => {
              const visible = matches(school);
              const isSelected = school.id === selectedId;
              const labelWidth = school.name.length * 5.6 + 14;

              return (
                <g
                  key={school.id}
                  className={`${styles.marker} ${visible ? "" : styles.dimmed}`}
                  onClick={() => visible && setSelectedId(school.id)}
                  onKeyDown={(e) => visible && selectFromKeyboard(e, school)}
                  tabIndex={visible ? 0 : -1}
                  role="button"
                  aria-label={`Show ${school.name}`}
                >
                  <circle
                    cx={school.x}
                    cy={school.y}
                    r={isSelected ? 8 : 5.5}
                    className={isSelected ? styles.dotSelected : styles.dot}
                  />
                  <rect
                    x={school.labelX}
                    y={school.labelY - 9}
                    width={labelWidth}
                    height={18}
                    rx={4}
                    className={styles.labelBox}
                  />
                  <text x={school.labelX + 7} y={school.labelY + 3.5} className={styles.labelText}>
                    {school.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>

        {/* ---------- Right panel: selected school ---------- */}
        <aside className={styles.panel}>
          {selected ? (
            <div className={styles.detail} key={selected.id}>
              <div className={styles.detailTop}>
                <div className={styles.schoolAvatar}>{selected.initials}</div>
                <button
                  className={styles.closeButton}
                  onClick={() => setSelectedId(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <h2 className={styles.schoolName}>{selected.name}</h2>
              <p className={styles.schoolMeta}>{selected.location}</p>

              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgePurple}`}>
                  {selected.teamCount} {selected.teamCount === 1 ? "team" : "teams"}
                </span>
                <span className={`${styles.badge} ${styles.badgeDark}`}>
                  {selected.games.length} {selected.games.length === 1 ? "game" : "games"}
                </span>
                {selected.recruiting && (
                  <span className={`${styles.badge} ${styles.badgeTeal}`}>Recruiting</span>
                )}
              </div>

              <p className={styles.description}>{selected.description}</p>

              <ul className={styles.teamList}>
                {selected.teams.map((team, i) => (
                  <li key={i}>
                    › {team.name} · {team.game}
                  </li>
                ))}
              </ul>

              {selected.href ? (
                <Link href={selected.href} className={styles.primaryButton}>
                  View school page
                </Link>
              ) : (
                <span className={`${styles.primaryButton} ${styles.disabled}`}>Page coming soon</span>
              )}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Pick a school</p>
              <p className={styles.emptyText}>Click a dot on the map to see the school&apos;s teams and info.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}