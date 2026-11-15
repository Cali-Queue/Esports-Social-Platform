import Link from "next/link";
import styles from "./teams.module.css";
import { school, teams, events, schoolInfo } from "./schoolData";

// Overview tab. The banner and tabs come from layout.jsx.
export default function TeamsOverviewPage() {
  return (
    <main className={styles.contentGrid}>
      <div className={styles.column}>
        <div className={styles.teamsGrid}>
          {teams.slice(0, 3).map((team) => (
            <div key={team.id} className={`${styles.panel} ${styles.teamCard}`}>
              <div className={styles.teamAvatar}>{team.initials}</div>
              <h3 className={styles.teamName}>{team.name}</h3>
              <p className={styles.teamGame}>{team.game}</p>
              <span className={`${styles.badge} ${styles[team.statusStyle]}`}>{team.status}</span>
              <Link href="/teams/rosters" className={styles.ghostButton}>View team</Link>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Upcoming events &amp; news</h2>
          {events.map((event) => (
            <div key={event.id} className={styles.eventRow}>
              <span className={`${styles.badge} ${styles.badgePurple} ${styles.datePill}`}>
                {event.date}
              </span>
              <div>
                <p className={styles.eventTitle}>{event.title}</p>
                <p className={styles.eventMeta}>{event.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={styles.column}>
        <div className={styles.panel}>
          {schoolInfo.map((row) => (
            <div key={row.label} className={styles.infoRow}>
              <span>{row.label}</span>
              <span className={styles.infoValue}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <span className={styles.wikiTag}>{school.name}</span>
          <p className={styles.wikiText}>
            School mods, Captains, and Coaches can propose edits. A School mod approves publishing.
          </p>
          <Link href="/teams/wiki" className={styles.darkButton}>Open school wiki</Link>
          <div className={styles.notice}>Students and Staff see Suggest correction instead.</div>
        </div>
      </aside>
    </main>
  );
}