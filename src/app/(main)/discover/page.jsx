'use client';

import { useEffect, useState } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import styles from './discover.module.css';
import PlayerCard from './PlayerCard';

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('Players'); //sets the initial state to Players on initial render
  const [selectedRoles, setSelectedRoles] = useState([]); //no selected roles
  const [lookingForTeam, setLookingForTeam] = useState(false); //sets the looking for team false
  const [isLoading, setIsLoading] = useState(true); //sets loading state to true

  const [results, setResults] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController(); //allows an abort if there is an error
    const category = activeTab.toLowerCase();

    async function loadResults() {
      setIsLoading(true); //loading logic here
      setLoadError('');
      setResults([]);

      try {
        const params = new URLSearchParams(); //creates a parameter object. this will be sent later on
        params.set('search', search.trim());

        if (activeTab === 'Players') { //append all of the roles and add them to the fetch request
          selectedRoles.forEach((role) => params.append('role', role));
          if (lookingForTeam) {
            params.set('looking_for_team', 'true');
          }
        }

        const response = await fetch(
          `/api/discover/${category}?${params.toString()}`,
          { signal: controller.signal } //prevents an older response from replacing newer search results
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data[category])) {
          throw new Error('Expected a results array.');
        }

        if (!controller.signal.aborted) {
          setResults(data[category]);
          setIsLoading(false);
        }
      } catch (error) { //if error, handle by updating the load state
        if (!controller.signal.aborted) {
          setLoadError(`Could not load ${category}.`);
          setIsLoading(false);
        }
      }
    }

    loadResults();
    return () => controller.abort();
  }, [activeTab, search, selectedRoles, lookingForTeam]);

  function changeTab(tab) { //on any tab change, we need to clear as if the page was just loaded
    setActiveTab(tab);
    setResults([]);
    setLoadError('');
    setIsLoading(true);
  }

  function toggleRole(role) { {/* purpose: add the role to the selected roles array if it is not already present in the array */}
    setSelectedRoles((previousRoles) =>
      previousRoles.includes(role) //returns true if the role is present and false if not
        ? previousRoles.filter((item) => item !== role) //true case: return an array the role removed if the role is already selected
        : [...previousRoles, role] //add to the array
    );
  }

  function clearFilters() { {/* sets all filters back to default by setting the roles back to empty and the team back to false */}
    setSearch('');
    setSelectedRoles([]);
    setLookingForTeam(false);
  }

  return (
    <section className={styles.page}>
      
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Find People to Play With</h1>

          <p className={styles.subtitle}>
            Discover verified players, teams, and schools across California.
          </p>
        </div>
        {/* top search bar */}
        <div className={styles.pageSearch} role="search">
          <Search size={18} aria-hidden="true" />

          <input
            type="search"
            placeholder="Search players, teams, or schools"
            aria-label="Search players, teams, or schools"
            value={search}
            onChange={(event) => setSearch(event.target.value)} 
          />
          {/* updates when the left search is updated */}
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Discover categories">
        {/* if the active tab is Players, then it will set it to the active style */}
        {/* Note: aria-pressed is communicates the pressed state ffor people using assistive technologies, onClick changes the state for react,
                  and the className visually highlights the active button  */}
        <button 
          type="button"
          className={`${styles.tab} ${ 
            activeTab === 'Players' ? styles.tabActive : ''
          }`}
          aria-pressed={activeTab === 'Players'}
          onClick={() => changeTab('Players')}
        >
          Players
        </button> 

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'Teams' ? styles.tabActive : ''
          }`}
          aria-pressed={activeTab === 'Teams'}
          onClick={() => changeTab('Teams')}
        >
          Teams
        </button>

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'Schools' ? styles.tabActive : ''
          }`}
          aria-pressed={activeTab === 'Schools'}
          onClick={() => changeTab('Schools')}
        >
          Schools
        </button>
      </nav>

      <div className={styles.content}>
        <form id="discover-filters" className={styles.filters} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.filterHeading}>
            {/* Uses the slider icon from the lucide react */}
            <SlidersHorizontal size={17} aria-hidden="true" />
            <h2>Filters</h2>
          </div>

          <div className={styles.field}>
            <label htmlFor="discover-search">
              {activeTab === 'Players' ? 'Player Name' : activeTab === 'Teams' ? 'Team Name' : 'School Name'} {/* keeps checking  using nested ternary operators*/}
            </label>
            
            <input
              id="discover-search"
              name="search"
              type="search"
              placeholder={`Search ${activeTab.toLowerCase()}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {activeTab !== 'Schools' && (
            <>
          <div className={styles.field}>
            <label htmlFor="school">School</label>
            {/* later on we can add more school options: for simplifying code, we can use .map() and an array holding the schools*/}

            <select disabled id="school" name="school" defaultValue="">
              <option value="">All schools</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="game">Game</label>
            {/* same thing here */}

            <select disabled id="game" name="game" defaultValue="">
              <option value="">All games</option>
            </select>
          </div>

            </>
          )}

          {activeTab === 'Players' && (
            <>
          <fieldset className={styles.filterGroup}>
            <legend>Role</legend>
            {/* buttons for all the roles. the button logic is very similar to the button logic for the players, teams, and schools tab*/}
            <div className={styles.filterOptions}>
              <button
                type="button"
                className={`${styles.filterOption} ${
                  selectedRoles.includes('Controller')
                    ? styles.filterOptionActive
                    : ''
                }`}
                onClick={() => toggleRole('Controller')}
                aria-pressed={selectedRoles.includes('Controller')}
              >
                Controller
              </button>

              <button
                type="button"
                className={`${styles.filterOption} ${
                  selectedRoles.includes('Duelist')
                    ? styles.filterOptionActive
                    : ''
                }`}
                onClick={() => toggleRole('Duelist')}
                aria-pressed={selectedRoles.includes('Duelist')}
              >
                Duelist
              </button>

              <button
                type="button"
                className={`${styles.filterOption} ${
                  selectedRoles.includes('IGL')
                    ? styles.filterOptionActive
                    : ''
                }`}
                onClick={() => toggleRole('IGL')}
                aria-pressed={selectedRoles.includes('IGL')}
              >
                IGL
              </button>

              <button
                type="button"
                className={`${styles.filterOption} ${
                  selectedRoles.includes('Flex')
                    ? styles.filterOptionActive
                    : ''
                }`}
                onClick={() => toggleRole('Flex')}
                aria-pressed={selectedRoles.includes('Flex')}
              >
                Flex
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.filterGroup}>
            <legend>Availability</legend>
            {/* we can add more options later. array implementation? */}
            <div className={styles.filterOptions}> 
              <button
                type="button"
                className={`${styles.filterOption} ${
                  lookingForTeam ? styles.filterOptionActive : ''
                }`}
                onClick={() =>
                  setLookingForTeam((previousValue) => !previousValue)
                }
                aria-pressed={lookingForTeam}
              >
                Looking for team
              </button>
            </div>
          </fieldset>
          
            </>
          )}

          {/* clears all of the selections using the clearFilters function*/}
          <button
            type="reset"
            className={styles.clearButton}
            onClick={clearFilters} 
          >
            <RotateCcw size={15} aria-hidden="true" />
            Clear all
          </button>
        </form>

        <section className={styles.results} aria-labelledby="results-heading">
          <div className={styles.resultsHeader}>
            <h2 id="results-heading">
              {activeTab}
              {!isLoading && !loadError && ` - ${results.length} Found`}
            </h2>
          </div>

          {isLoading ? (<p role="status">Loading {activeTab.toLowerCase()}…</p>) : loadError ? (<p role="alert">{loadError}</p>
          ) : results.length === 0 ? (
            <div className={styles.emptyResults}>
              <span className={styles.emptyIcon}>
                <Users size={27} aria-hidden="true" />
              </span>
              <h3>No {activeTab.toLowerCase()} found</h3>
              <p>Try changing your search or clearing your filters.</p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={clearFilters}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul className={styles.playerList}>
              {/* map does this for every single item in the resulting array */}
              {results.map((item) =>
                activeTab === 'Players' ? (
                  /* if the tab is players, then we need to create the player card */
                  <PlayerCard key={item.id} player={item} />
                ) : (
                  /* if the tab is not players... */
                  /* create the card */
                  <li key={item.id} className={styles.playerCard}>
                    <span className={styles.playerAvatar} aria-hidden="true">
                      {/* default no profile picture, just take the first two letters */}
                      {item.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className={styles.playerInfo}>
                      <div className={styles.playerHeading}>
                        <h3>{item.name}</h3>
                      </div>
                      {/* if the tab is teams then we need additional info, not for schools atm */}
                      {activeTab === 'Teams' && (
                        <>
                          <p className={styles.playerSchool}>{item.school}</p>
                          {item.game && (
                            <div className={styles.playerBadges}>
                              <span className={styles.gameBadge}>{item.game}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}