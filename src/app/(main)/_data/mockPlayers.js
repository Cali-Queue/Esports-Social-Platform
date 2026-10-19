// Fake data so the profile pages have something to show.
// TODO(backend): replace with calls to the players/profile API.

// whoever is "logged in" for now
export const CURRENT_USER_HANDLE = 'kairoarc';

export const players = {
  kairoarc: {
    handle: 'kairoarc',
    gamertag: 'KairoArc',
    initials: 'KA',
    role: 'Athlete',
    realName: 'Kai Arcenas',
    showRealName: false,
    school: 'Sacramento State',
    team: 'Sac State Gold',
    gradYear: 2027,
    game: 'Valorant',
    position: 'Controller',
    rank: 'Ascendant 2',
    peakRank: 'Ascendant 3',
    pronouns: 'he/him',
    lookingForTeam: true,
    online: true,
    bio: 'Smokes on time, comms on point. Grinding toward Immortal and looking for scrim partners across NorCal.',
    interests: ['Scrims', 'Recruiting', 'Campus events'],
    followers: 248,
    friends: 86,
    endorsement: 92,
    banner: '/images/profile-banner.jpg',
    achievements: [
      { year: 2026, title: 'Sac State Gold · Starting roster' },
      { year: 2025, title: 'Hornet LAN Night · 1st place' },
    ],
    posts: [
      {
        id: 'ka-1',
        authorHandle: 'kairoarc',
        time: '2h',
        body: 'Finally hit Ascendant 2. Huge thanks to the Sac State Gold squad for all the late-night VOD sessions.',
        likes: 64,
        comments: 9,
        shares: 2,
      },
    ],
  },

  astrazen: {
    handle: 'astrazen',
    gamertag: 'AstraZen',
    initials: 'AZ',
    role: 'Athlete',
    realName: null,
    showRealName: false,
    school: 'Sacramento State',
    team: 'Sac State Gold',
    game: 'Valorant',
    position: 'Controller',
    rank: 'Ascendant 3',
    peakRank: 'Immortal 1',
    pronouns: 'they/them',
    lookingForTeam: true,
    online: true,
    bio: 'Calm comms, utility-first play, and two years of collegiate tournament experience. Open to 2027 roster conversations.',
    interests: ['Scrims', 'Recruiting', 'VOD review', 'Campus events'],
    followers: 1204,
    friends: 143,
    endorsement: 96,
    banner: '/images/profile-banner.jpg',
    achievements: [
      { year: 2026, title: 'NorCal Collegiate Open · 2nd place' },
      { year: 2025, title: 'CALI Summer Circuit · Controller MVP' },
      { year: 2024, title: 'Sac State Gold · Starting roster' },
    ],
    // posts shown on a profile can be from other people (reposts / tags)
    posts: [
      {
        id: 'nv-1',
        authorHandle: 'novavex',
        time: '24m',
        body: 'Late-night scrim, cleaner comms, better trades. Looking for two more California collegiate teams for next week’s set.',
        image: '/images/post-arena.jpg',
        likes: 128,
        comments: 18,
        shares: 8,
      },
    ],
  },

  novavex: {
    handle: 'novavex',
    gamertag: 'NovaVex',
    initials: 'NV',
    role: 'Captain',
    realName: null,
    showRealName: false,
    school: 'UC Davis',
    team: 'Aggie Esports Blue',
    game: 'Valorant',
    position: 'Initiator',
    rank: 'Immortal 2',
    peakRank: 'Immortal 3',
    pronouns: 'she/her',
    lookingForTeam: false,
    online: true,
    bio: 'Captain for Aggie Esports Blue. Always down to set up scrims with other California schools.',
    interests: ['Scrims', 'Recruiting'],
    followers: 2310,
    friends: 201,
    endorsement: 98,
    banner: '/images/profile-banner.jpg',
    achievements: [
      { year: 2026, title: 'NorCal Collegiate Open · 1st place' },
      { year: 2025, title: 'Aggie Esports Blue · Captain' },
    ],
    posts: [
      {
        id: 'nv-1',
        authorHandle: 'novavex',
        time: '24m',
        body: 'Late-night scrim, cleaner comms, better trades. Looking for two more California collegiate teams for next week’s set.',
        image: '/images/post-arena.jpg',
        likes: 128,
        comments: 18,
        shares: 8,
      },
    ],
  },
};

export function getPlayer(handle) {
  return players[handle?.toLowerCase()] ?? null;
}
