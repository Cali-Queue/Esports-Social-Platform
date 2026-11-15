"use client";

import { useState } from "react";
import shared from "../teams.module.css"; // panel, avatar, colors 
import styles from "./rosters.module.css"; // styles for this tab only
import { games, players } from "../schoolData";

// Rosters tab: every player at the school, with their gamertag and game.
export default function RostersPage() {
  const [activeGame, setActiveGame] = useState("All");

  const shown =
    activeGame === "All" ? players : players.filter((player) => player.game === activeGame);

  return (
    <main className={shared.section}>
      <div className={shared.sectionHeader}>
        <h2 className={shared.sectionTitle}>Rosters</h2>
        <p className={shared.sectionLead}>{players.length} players</p>
      </div>

      {/* Filter by game */}
      <div className={styles.filterRow}>
        {["All", ...games.map((g) => g.name)].map((name) => (
          <button
            key={name}
            className={`${styles.filterChip} ${activeGame === name ? styles.filterChipActive : ""}`}
            onClick={() => setActiveGame(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={`${shared.panel} ${styles.rosterPanel}`}>
        <div className={styles.rosterHead}>
          <span>Player</span>
          <span>Gamertag</span>
          <span>Game</span>
        </div>

        <ul>
          {shown.map((player) => (
            // Later: wrap this row in <Link href={`/players/${player.handle}`}> to make it clickable.
            <li key={player.id} className={styles.rosterRow}>
              <div className={styles.rosterPlayer}>
                <div className={shared.smallAvatar}>{player.initials}</div>
                <span>{player.name}</span>
              </div>
              <span className={styles.gamertag}>@{player.gamertag}</span>
              <span className={styles.rosterGame}>{player.game}</span>
            </li>
          ))}
        </ul>

        {shown.length === 0 && (
          <p className={`${shared.emptyText} ${styles.empty}`}>No players for this game yet.</p>
        )}
      </div>
    </main>
  );
}
