import shared from "../teams.module.css"; // panel, badge, colors 
import styles from "./games.module.css"; // styles for this tab only
import { games, teams } from "../schoolData";

// Teams & games tab
// Each game has a short icon, name, and number of teams. Each team has an avatar, name, and status badge.

export default function TeamsAndGamesPage() {
  return (
    <main className={shared.section}>
      <div className={shared.sectionHeader}>
        <h2 className={shared.sectionTitle}>Teams &amp; games</h2>
        <p className={shared.sectionLead}>
          {games.length} games · {teams.length} teams
        </p>
      </div>

      <div className={styles.gamesGrid}>
        {games.map((game) => {
          const gameTeams = teams.filter((team) => team.game === game.name);

          return (
            <div key={game.name} className={shared.panel}>
              <div className={styles.gameHeader}>
                <div className={styles.gameIcon}>{game.short}</div>
                <div>
                  <h3 className={styles.gameName}>{game.name}</h3>
                  <p className={styles.gameCount}>
                    {gameTeams.length} {gameTeams.length === 1 ? "team" : "teams"}
                  </p>
                </div>
              </div>

              {gameTeams.length === 0 ? (
                <p className={shared.emptyText}>No teams for this game yet.</p>
              ) : (
                <ul className={styles.gameTeamList}>
                  {gameTeams.map((team) => (
                    <li key={team.id} className={styles.gameTeamRow}>
                      <div className={shared.smallAvatar}>{team.initials}</div>
                      <span className={styles.gameTeamName}>{team.name}</span>
                      <span className={`${shared.badge} ${shared[team.statusStyle]}`}>{team.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}