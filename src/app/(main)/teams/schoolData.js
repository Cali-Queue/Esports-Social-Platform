// Placeholder data shared by every Teams sub-page.
// Later, replace these with data from the database (school, team, and teammember tables).

export const school = {
  initials: "SS",
  name: "Sacramento State Esports",
};

export const teams = [
  { id: 1, initials: "T1", name: "Team Name", game: "Valorant", status: "Competing", statusStyle: "badgeTeal" },
  { id: 2, initials: "T2", name: "Team Name", game: "Rocket League", status: "Competing", statusStyle: "badgePurple" },
  { id: 3, initials: "T3", name: "Team Name", game: "League of Legends", status: "Open tryouts", statusStyle: "badgePurple" },
  { id: 4, initials: "T4", name: "Team Name", game: "Valorant", status: "Open tryouts", statusStyle: "badgePurple" },
  { id: 5, initials: "T5", name: "Team Name", game: "Overwatch 2", status: "Competing", statusStyle: "badgeTeal" },
];

export const games = [
  { name: "Valorant", short: "VAL" },
  { name: "League of Legends", short: "LoL" },
  { name: "Rocket League", short: "RL" },
  { name: "Overwatch 2", short: "OW2" },
];

// handle = the player's link name. Later, each roster row can link to /players/[handle].
export const players = [
  { id: 1, initials: "P1", name: "Player Name", gamertag: "Gamertag", game: "Valorant", handle: "player-1" },
  { id: 2, initials: "P2", name: "Player Name", gamertag: "Gamertag", game: "Valorant", handle: "player-2" },
  { id: 3, initials: "P3", name: "Player Name", gamertag: "Gamertag", game: "League of Legends", handle: "player-3" },
  { id: 4, initials: "P4", name: "Player Name", gamertag: "Gamertag", game: "League of Legends", handle: "player-4" },
  { id: 5, initials: "P5", name: "Player Name", gamertag: "Gamertag", game: "Rocket League", handle: "player-5" },
  { id: 6, initials: "P6", name: "Player Name", gamertag: "Gamertag", game: "Rocket League", handle: "player-6" },
  { id: 7, initials: "P7", name: "Player Name", gamertag: "Gamertag", game: "Overwatch 2", handle: "player-7" },
  { id: 8, initials: "P8", name: "Player Name", gamertag: "Gamertag", game: "Overwatch 2", handle: "player-8" },
];

export const events = [
  { id: 1, date: "DATE", title: "Event title", meta: "Location · Time" },
  { id: 2, date: "DATE", title: "Event title", meta: "Location · Time" },
  { id: 3, date: "DATE", title: "Event title", meta: "Location · Time" },
];

export const schoolInfo = [
  { label: "Open lab", value: "TBD" },
  { label: "Location", value: "TBD" },
  { label: "Contact", value: "TBD" },
  { label: "President", value: "TBD" },
];

// Each section becomes a heading in the wiki. id is used for the "On this page" links.
export const wikiSections = [
  {
    id: "about",
    title: "About the club",
    body: "Write a short introduction to the club here: when it started, what it's about, and who can join.",
  },
  {
    id: "teams",
    title: "Teams & games",
    body: "List the games the school competes in and how the teams are organized.",
  },
  {
    id: "open-lab",
    title: "Open lab hours",
    body: "Add the lab's days, hours, and location, plus any rules for using the lab.",
  },
  {
    id: "join",
    title: "How to join",
    body: "Explain how students can join the club, sign up for tryouts, or get on the Discord.",
  },
  {
    id: "contact",
    title: "Contact",
    body: "Add the club's email, social links, and officers to contact.",
  },
];
