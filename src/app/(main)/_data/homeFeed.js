// Placeholder data for the home feed until the feed and events APIs exist.
// Post shapes follow the feed API fields in Jira subtask 2.2, so swapping in
// real data is a drop-in. Players with a `handle` in mockPlayers.js link to
// their profile page.
// TODO(backend): replace with GET /api/feed and the school events endpoint.

export const posts = [
  {
    id: 'p1',
    tab: ['following', 'foryou'],
    author: { displayName: 'Sac State Gold', initials: 'SG', school: 'Sacramento State', isTeam: true },
    text: 'GG to UC Davis in the NorCal Valorant quarterfinals. 13-9, 13-11. Semis this Saturday at 6pm in the esports lab, come through and bring the noise.',
    media: { kind: 'scoreboard', home: 'Sac State', away: 'UC Davis', score: '2 - 0', label: 'NorCal Valorant · Quarterfinal' },
    game: 'Valorant',
    likeCount: 84,
    commentCount: 12,
    likedByMe: true,
    createdAt: '2h',
  },
  {
    id: 'p2',
    tab: ['following', 'foryou'],
    author: { displayName: 'NovaVex', handle: 'novavex', initials: 'NV', school: 'UC Davis', role: 'Captain' },
    text: 'Late-night scrim, cleaner comms, better trades. Looking for two more California collegiate teams for next week’s set.',
    media: { kind: 'image', src: '/images/post-arena.jpg' },
    game: 'Valorant',
    likeCount: 128,
    commentCount: 18,
    likedByMe: false,
    createdAt: '5h',
  },
  {
    id: 'p3',
    tab: ['foryou'],
    author: { displayName: 'Cal Poly SLO Esports', initials: 'CP', school: 'Cal Poly SLO', isTeam: true },
    text: 'Rocket League tryouts open next week. We are looking for a third with strong rotations. Diamond 3+ preferred, drop your tracker below.',
    media: { kind: 'banner', title: 'Rocket League Tryouts', subtitle: 'Oct 24 to 26 · Cal Poly SLO' },
    game: 'Rocket League',
    likeCount: 63,
    commentCount: 19,
    likedByMe: false,
    createdAt: '8h',
  },
  {
    id: 'p4',
    tab: ['following'],
    author: { displayName: 'AstraZen', handle: 'astrazen', initials: 'AZ', school: 'Sacramento State', role: 'Athlete' },
    text: 'Back in Immortal 1. Huge thanks to the squad for duo grinding every night this month. Running VOD review in the lab Wednesday if anyone wants in.',
    game: 'Valorant',
    likeCount: 112,
    commentCount: 24,
    likedByMe: false,
    createdAt: '1d',
  },
  {
    id: 'p5',
    tab: ['foryou'],
    author: { displayName: 'Ana Lucero', initials: 'AL', school: 'San Jose State', role: 'Athlete' },
    text: 'Anyone on a California campus streaming League this weekend? Putting together a collegiate co-stream for the regional finals.',
    game: 'League of Legends',
    likeCount: 27,
    commentCount: 9,
    likedByMe: false,
    createdAt: '1d',
  },
];

export const upcomingEvents = [
  { id: 'e1', month: 'OCT', day: '25', title: 'NorCal Valorant Semifinal', meta: 'Sac State vs. UC Berkeley · 6:00 PM' },
  { id: 'e2', month: 'OCT', day: '29', title: 'Open play night', meta: 'Sac State Esports Lab · 7:00 PM' },
  { id: 'e3', month: 'NOV', day: '02', title: 'Rocket League tryouts', meta: 'Cal Poly SLO · All day' },
];

export const recruitingTeams = [
  { id: 't1', name: 'Hornet Hive', meta: 'Sacramento State · Rocket League', need: 'Needs 1 striker' },
  { id: 't2', name: 'Aggie Esports', meta: 'UC Davis · Overwatch 2', need: 'Needs a support' },
];

export const myTeams = [
  { id: 'mt1', name: 'Sac State Gold', game: 'Valorant', role: 'Athlete' },
  { id: 'mt2', name: 'Stingers', game: 'League of Legends', role: 'Athlete' },
];
