'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useSetupStep from './useSetupStep';
import styles from '../setup.module.css';

// TODO(backend): load games from the server, maybe this can be typed instead(TBD)
const games = ['Valorant', 'League of Legends', 'Overwatch 2', 'Rocket League', 'Super Smash Bros. Ultimate'];

// Step 3 form: current team and main game.
// teams come from the Team table (empty until teams are added to the database)
export default function TeamGamesStep({ nextHref }) {
  const { profile, errors, formError, saving, submit } = useSetupStep(nextHref);
  const [teams, setTeams] = useState(null); // null while loading, then [{ id, name, school, game }]
  const [teamId, setTeamId] = useState('');
  const [game, setGame] = useState('');

  // once the profile loads: fill in saved values and load teams from the user's school
  useEffect(() => {
    if (!profile) return;
    setTeamId(profile.team ? String(profile.team.id) : '');
    setGame(profile.game);

    // only show teams from the user's school if they picked one, otherwise show every team
    const query = profile.school ? `?school=${encodeURIComponent(profile.school.name)}` : '';
    fetch(`/api/discover/teams${query}`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => setTeams([]));
  }, [profile]);

  function handleSubmit(event) {
    event.preventDefault();
    // '' means "No team"
    submit({ team_id: teamId || null, game });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="setup-team" className={styles.label}>Current team</label>
        <div className={styles.selectWrap}>
          <select
            id="setup-team"
            className={`${styles.input} ${styles.select}`}
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            disabled={!teams}
          >
            <option value="">{teams ? 'No team' : 'Loading teams…'}</option>
            {teams?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
        {errors.team_id && <p className={styles.error}>{errors.team_id}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="setup-game" className={styles.label}>Game</label>
        <div className={styles.selectWrap}>
          <select
            id="setup-game"
            className={`${styles.input} ${styles.select}`}
            value={game}
            onChange={(event) => setGame(event.target.value)}
            required
          >
            <option value="" disabled>Select game</option>
            {games.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown size={16} className={styles.selectIcon} />
        </div>
        {errors.game && <p className={styles.error}>{errors.game}</p>}
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button type="submit" className={`${styles.button} ${styles.purple}`} disabled={!profile || saving}>
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
