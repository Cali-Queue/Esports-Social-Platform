import styles from "./teams.module.css";
 

// Later, replace these with data from the team tables in the database.
const teams = [
  { id: 1, initials: "T1", name: "Team Name", game: "Game", status: "Status", statusStyle: "badgeTeal" },
  { id: 2, initials: "T2", name: "Team Name", game: "Game", status: "Status", statusStyle: "badgePurple" },
  { id: 3, initials: "T3", name: "Team Name", game: "Game", status: "Status", statusStyle: "badgePurple" },
];
 
const events = [
  { id: 1, date: "DATE", title: "Event title", meta: "Location · Time" },
  { id: 2, date: "DATE", title: "Event title", meta: "Location · Time" },
  { id: 3, date: "DATE", title: "Event title", meta: "Location · Time" },
];
 
const schoolInfo = [
  { label: "Open lab", value: "TBD" },
  { label: "Location", value: "TBD" },
  { label: "Contact", value: "TBD" },
  { label: "President", value: "TBD" },
];
 
const tabs = ["Overview", "Teams & games", "Rosters", "Events & news", "School Wiki"];
 
export default function TeamsPage() {
  return (
    <div className={styles.page}>
      {/* School banner */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroAvatar}>SS</div>
          <div className={styles.heroTitleRow}>
            <h1 className={styles.heroTitle}>Sacramento State Esports</h1>
            <span className={`${styles.badge} ${styles.badgeTeal}`}>Verified</span>
          </div>
          <button className={styles.followButton}>Follow school</button>
        </div>
      </section>
 
      {/* Tabs */}
      <nav className={styles.tabs}>
        {tabs.map((tab, i) => (
          <a key={tab} href="#" className={i === 0 ? styles.activeTab : undefined}>
            {tab}
          </a>
        ))}
      </nav>
 
      {/* Main content */}
      <main className={styles.contentGrid}>
        <div className={styles.column}>
          <div className={styles.teamsGrid}>
            {teams.map((team) => (
              <div key={team.id} className={`${styles.panel} ${styles.teamCard}`}>
                <div className={styles.teamAvatar}>{team.initials}</div>
                <h3 className={styles.teamName}>{team.name}</h3>
                <p className={styles.teamGame}>{team.game}</p>
                <span className={`${styles.badge} ${styles[team.statusStyle]}`}>{team.status}</span>
                <a href="#" className={styles.ghostButton}>View team</a>
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
            <span className={styles.wikiTag}>Sacramento State Esports</span>
            <p className={styles.wikiText}>
              Managers, Captains, and Coaches can propose edits. A School Director can approve publishing.
            </p>
            <button className={styles.darkButton}>Edit school wiki</button>
            <div className={styles.notice}>Students and Staff see Suggest correction instead.</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
 
