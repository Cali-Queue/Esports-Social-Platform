'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SearchX, Users } from 'lucide-react';
import { checkSearchQuery, MAX_SEARCH_LENGTH } from '../../../lib/search-query.mjs';
import PlayerCard from '../discover/PlayerCard';
import discover from '../discover/discover.module.css';
import styles from './search.module.css';

export default function SearchResults({ q }) {
  const router = useRouter();
  const [text, setText] = useState(q);
  const [inputError, setInputError] = useState('');
  // status: 'empty' (nothing searched), 'invalid', 'loading', 'error' or 'done'
  const [status, setStatus] = useState('empty');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState({ query: '', players: [], teams: [] });

  // runs whenever the ?q= in the URL changes (from this page or the navbar)
  useEffect(() => {
    setText(q);
    setInputError('');
    const { query, error } = checkSearchQuery(q);
    if (error) {
      setStatus('invalid');
      setMessage(error);
      return;
    }
    if (!query) {
      setStatus('empty');
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    (async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: 'same-origin',
          signal: controller.signal, // an older search can't overwrite a newer one
        });
        const data = await response.json().catch(() => ({}));
        if (controller.signal.aborted) return;
        if (response.status === 400) {
          setStatus('invalid');
          setMessage(data.detail || 'That search is not allowed.');
        } else if (!response.ok || !Array.isArray(data.players) || !Array.isArray(data.teams)) {
          setStatus('error');
        } else {
          setResults(data);
          setStatus('done');
        }
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [q]);

  function handleSubmit(event) {
    event.preventDefault();
    const { query, error } = checkSearchQuery(text);
    if (error) {
      setInputError(error);
      return;
    }
    setInputError('');
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  const total = results.players.length + results.teams.length;

  return (
    <section className={discover.page}>
      <header className={discover.pageHeader}>
        <div>
          <h1 className={discover.title}>Search</h1>
          <p className={discover.subtitle}>Find students and teams by name.</p>
        </div>

        <form className={styles.form} role="search" onSubmit={handleSubmit} noValidate>
          <div className={discover.pageSearch}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              name="q"
              placeholder="Search students or teams"
              aria-label="Search students or teams"
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? 'search-error' : undefined}
              maxLength={MAX_SEARCH_LENGTH}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (inputError) setInputError('');
              }}
            />
          </div>
          {inputError && (
            <p id="search-error" className={styles.inputError} role="alert">{inputError}</p>
          )}
        </form>
      </header>

      <div className={styles.body}>
        {status === 'empty' && (
          <Notice icon={Search} title="Search for a student or team">
            Type a name in the search box to see matching students and teams.
          </Notice>
        )}

        {status === 'invalid' && (
          <Notice icon={SearchX} title="Invalid search">{message}</Notice>
        )}

        {status === 'loading' && <p role="status">Searching…</p>}

        {status === 'error' && <p role="alert">Could not load search results. Please try again.</p>}

        {status === 'done' && total === 0 && (
          <Notice icon={Users} title="No results found">
            No students or teams match &ldquo;{results.query}&rdquo;.
          </Notice>
        )}

        {status === 'done' && total > 0 && (
          <>
            <ResultSection title="Students" count={results.players.length}>
              {results.players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </ResultSection>

            <ResultSection title="Teams" count={results.teams.length}>
              {results.teams.map((team) => (
                <li key={team.id} className={discover.playerCard}>
                  <span className={discover.playerAvatar} aria-hidden="true">
                    {team.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className={discover.playerInfo}>
                    <div className={discover.playerHeading}>
                      <h3>{team.name}</h3>
                    </div>
                    <p className={discover.playerSchool}>{team.school}</p>
                    {team.game && (
                      <div className={discover.playerBadges}>
                        <span className={discover.gameBadge}>{team.game}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ResultSection>
          </>
        )}
      </div>
    </section>
  );
}

function ResultSection({ title, count, children }) {
  const id = `search-${title.toLowerCase()}`;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        {title} - {count} Found
      </h2>
      {count === 0 ? (
        <p className={styles.none}>No {title.toLowerCase()} match this search.</p>
      ) : (
        <ul className={discover.playerList}>{children}</ul>
      )}
    </section>
  );
}

function Notice({ icon: Icon, title, children }) {
  return (
    <div className={discover.emptyResults}>
      <span className={discover.emptyIcon}>
        <Icon size={27} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
