'use client';

{/* exact matches is empty for now but will be populated by django later on */}
const exactMatches = [];

import { useState } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  Target,
  Users,
} from 'lucide-react';
import styles from './discover.module.css';

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('Players'); {/* Sets the initial state to Players on initial render*/}
  const [selectedRoles, setSelectedRoles] = useState([]); {/* no selected roles */}
  const [lookingForTeam, setLookingForTeam] = useState(false); {/* sets the looking for team false */}

  function toggleRole(role) { {/* purpose: add the role to the selected roles array if it is not already present in the array */}
    setSelectedRoles((previousRoles) =>
      previousRoles.includes(role)
        ? previousRoles.filter((item) => item !== role)
        : [...previousRoles, role]
    );
  }

  function clearFilters() { {/* sets all filters back to default by setting the roles back to empty and the team back to false */}
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

        <div className={styles.pageSearch} role="search">
          <Search size={18} aria-hidden="true" />

          <input
            type="search"
            placeholder="Search players, teams, or schools"
            aria-label="Search players, teams, or schools"
          />
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
          onClick={() => setActiveTab('Players')}
        >
          Players
        </button> 

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'Teams' ? styles.tabActive : ''
          }`}
          aria-pressed={activeTab === 'Teams'}
          onClick={() => setActiveTab('Teams')}
        >
          Teams
        </button>

        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'Schools' ? styles.tabActive : ''
          }`}
          aria-pressed={activeTab === 'Schools'}
          onClick={() => setActiveTab('Schools')}
        >
          Schools
        </button>
      </nav>

      <div className={styles.content}>
        <form id="discover-filters" className={styles.filters}>
          <div className={styles.filterHeading}>
            {/* Uses the slider icon from the lucide react */}
            <SlidersHorizontal size={17} aria-hidden="true" />
            <h2>Filters</h2>
          </div>

          <div className={styles.field}>
            <label htmlFor="player-name">Player Name</label>
            {/* We will need to implement form submission later on*/}
            <input
              id="player-name"
              name="playerName"
              type="search"
              placeholder="Gamertag or name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="school">School</label>
            {/* later on we can add more school options: for simplifying code, we can use .map() and an array holding the schools*/}

            <select id="school" name="school" defaultValue="">
              <option value="">All schools</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="game">Game</label>
            {/* same thing here*/}

            <select id="game" name="game" defaultValue="">
              <option value="">All games</option>
            </select>
          </div>

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
            <div>
              <h2 id="results-heading">{activeTab}</h2>

              <p>
                Browse {activeTab.toLowerCase()} that match your search.
              </p>
            </div>

            <span className={styles.sortLabel}>Best match</span>
          </div>
          
          {/* This is a placeholder section for now and will be extended upon later on when connecting to the backend */}
          <div className={styles.emptyResults}>
            <span className={styles.emptyIcon}>
              <Users size={27} aria-hidden="true" />
            </span>

            <h3>{activeTab} will appear here</h3>

            <p>
              Use the search and filters to find results by school, game,
              role, or availability.
            </p>
          </div>
        </section>
        {/* This code block will only show when there are no matches */}
        {exactMatches.length === 0 && (
          <aside
            className={styles.exactPanel}
            aria-labelledby="exact-heading"
          >
            <div className={styles.exactVisual}>
              <Target size={32} aria-hidden="true" />
            </div>

            <h2 id="exact-heading">No exact matches</h2>

            <p>
              Broaden your school or role filters to discover more potential
              teammates.
            </p>
            {/* Another button to clear filters */}
            <button
              type="reset"
              form="discover-filters"
              className={styles.resetButton}
              onClick={clearFilters}
            >
              Reset filters
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}