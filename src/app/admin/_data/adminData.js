// Mock data for the admin console. Values come from the Figma frames.
// TODO(backend): replace with real admin endpoints (users, stats, wiki submissions).

export const ADMIN_ME = {
  name: 'Kai Alvarez',
  initials: 'KA',
  title: 'Platform moderator',
  email: 'moderation@caliqueue.org',
};

// Whole-platform numbers. The directory below only holds a sample of users,
// so these are fixed until the backend can count the real thing.
export const PLATFORM_STATS = {
  totalUsers: 8412,
  totalUsersChange: '+8.6% this month',
  activeThisWeek: 6907,
  schoolAccounts: 74,
  schoolAccountsPending: 6,
  openReports: 23,
  openReportsChange: '−12%',
  needsReviewIdentity: 12,
  needsReviewSchool: 19,
  inactive180: 119,
  approvedThisWeek: 47,
  acceptanceRate: '92%',
  oldestRequest: '18h',
  needsSources: 3,
};

export const ROLES = ['Athlete', 'Student', 'Captain', 'Coach', 'Fan'];

// status: 'active' | 'review' | 'inactive' | 'suspended'
export const USERS = [
  { id: 'u1', username: 'KairoArc', email: 'kairo@csus.edu', memberSince: '2023-08-14', school: 'Sacramento State', role: 'Athlete', status: 'active', color: '#3b2f7a', lastActive: '2 hours ago', team: 'Sac State Valorant', games: ['Valorant'], reports: 0 },
  { id: 'u2', username: 'AstraZen', email: 'astra@csus.edu', memberSince: '2024-01-22', school: 'Sacramento State', role: 'Student', status: 'active', color: '#2b4a7d', lastActive: 'Yesterday', team: null, games: ['League of Legends', 'Overwatch 2'], reports: 0 },
  { id: 'u3', username: 'BruinByte', email: 'byte@ucla.edu', memberSince: '2022-09-03', school: 'UCLA', role: 'Captain', status: 'review', reviewReason: 'Captain badge request needs school confirmation', color: '#1f5c5a', lastActive: '3 hours ago', team: 'UCLA Rocket League', games: ['Rocket League'], reports: 1 },
  { id: 'u4', username: 'PixelPoppy', email: 'poppy@uci.edu', memberSince: '2024-03-18', school: 'UC Irvine', role: 'Athlete', status: 'active', color: '#6b2e48', lastActive: '20 min ago', team: 'UC Irvine Overwatch', games: ['Overwatch 2'], reports: 0 },
  { id: 'u5', username: 'GoldenGriff', email: 'griff@ucsb.edu', memberSince: '2023-11-09', school: 'UC Santa Barbara', role: 'Coach', status: 'active', color: '#7a5418', lastActive: 'Today', team: 'UCSB Valorant', games: ['Valorant', 'Rocket League'], reports: 0 },
  { id: 'u6', username: 'DormantFox', email: 'fox@ucsd.edu', memberSince: '2022-05-27', school: 'UC San Diego', role: 'Fan', status: 'inactive', inactiveDays: 181, color: '#2e3a7a', lastActive: '181 days ago', team: null, games: ['Super Smash Bros.'], reports: 0 },
  { id: 'u7', username: 'NovaNiner', email: 'nova@csulb.edu', memberSince: '2024-02-11', school: 'Cal State Long Beach', role: 'Student', status: 'active', color: '#27457a', lastActive: '5 hours ago', team: null, games: ['League of Legends'], reports: 0 },
  { id: 'u8', username: 'TritonTide', email: 'tide@ucsd.edu', memberSince: '2023-04-02', school: 'UC San Diego', role: 'Captain', status: 'active', color: '#1d5a6e', lastActive: 'Today', team: 'UCSD Triton Gaming', games: ['League of Legends'], reports: 0 },
  { id: 'u9', username: 'MustangMira', email: 'mira@calpoly.edu', memberSince: '2024-06-30', school: 'Cal Poly SLO', role: 'Athlete', status: 'review', reviewReason: 'Student email could not be verified', color: '#4d3b7a', lastActive: '1 day ago', team: 'Cal Poly Rocket League', games: ['Rocket League'], reports: 2 },
  { id: 'u10', username: 'QuietQuill', email: 'quill@sfsu.edu', memberSince: '2021-10-15', school: 'San Francisco State', role: 'Fan', status: 'inactive', inactiveDays: 204, color: '#5a3b2e', lastActive: '204 days ago', team: null, games: ['Hearthstone'], reports: 0 },
  { id: 'u11', username: 'HornetHex', email: 'hex@csus.edu', memberSince: '2023-02-19', school: 'Sacramento State', role: 'Athlete', status: 'suspended', color: '#6e2a2a', lastActive: '12 days ago', team: 'Sac State Overwatch', games: ['Overwatch 2'], reports: 4 },
  { id: 'u12', username: 'SlugSprint', email: 'sprint@ucsc.edu', memberSince: '2024-09-05', school: 'UC Santa Cruz', role: 'Student', status: 'active', color: '#2f6b3d', lastActive: '1 hour ago', team: null, games: ['Valorant'], reports: 0 },
  { id: 'u13', username: 'AggieAce', email: 'ace@ucdavis.edu', memberSince: '2022-12-01', school: 'UC Davis', role: 'Coach', status: 'active', color: '#3a4f7a', lastActive: 'Today', team: 'UC Davis League', games: ['League of Legends', 'Valorant'], reports: 0 },
  { id: 'u14', username: 'BearCubBen', email: 'ben@berkeley.edu', memberSince: '2024-04-27', school: 'UC Berkeley', role: 'Student', status: 'active', color: '#2b3f6b', lastActive: '3 days ago', team: null, games: ['Rocket League'], reports: 0 },
];

// type: 'Edit' | 'New page' | 'Join team'
// status: 'pending' | 'approved' | 'denied'
// minutesAgo is only used for sorting by "Submitted".
export const WIKI_SUBMISSIONS = [
  { id: 'w1', name: 'Maya Chen', handle: 'MChen', initials: 'MC', color: '#3b2f7a', page: 'Sac State Valorant · 2026 roster', summary: 'Adds five verified starters and two substitutes.', school: 'Sacramento State', submitted: '18 min ago', minutesAgo: 18, type: 'Edit', status: 'pending' },
  { id: 'w2', name: 'Jordan Lee', handle: 'JLeeGG', initials: 'JL', color: '#2b4a7d', page: 'UCLA Esports Training Center', summary: 'New facilities page with sources and campus links.', school: 'UCLA', submitted: '42 min ago', minutesAgo: 42, type: 'New page', status: 'pending' },
  { id: 'w3', name: 'Sofia Ramirez', handle: 'SofiR', initials: 'SR', color: '#6b2e48', page: 'UC Irvine Overwatch history', summary: 'Updates 2024–25 placements and coaching staff.', school: 'UC Irvine', submitted: '1 hr ago', minutesAgo: 60, type: 'Edit', status: 'pending' },
  { id: 'w4', name: 'Eli Thompson', handle: 'GoldenEli', initials: 'ET', color: '#7a5418', page: 'Cal Poly Rocket League', summary: 'Creates team overview, achievements, and socials.', school: 'Cal Poly SLO', submitted: '2 hrs ago', minutesAgo: 120, type: 'New page', status: 'pending' },
  { id: 'w5', name: 'Priya Shah', handle: 'PriyaPlays', initials: 'PS', color: '#1f5c5a', page: 'UCSD Triton Gaming leadership', summary: 'Corrects officers and adds election references.', school: 'UC San Diego', submitted: '4 hrs ago', minutesAgo: 240, type: 'Edit', status: 'pending' },
  { id: 'w6', name: 'Noah Williams', handle: 'NWill', initials: 'NW', color: '#2e3a7a', page: 'CSULB League of Legends', summary: 'Adds current roster, match record, and citations.', school: 'Cal State Long Beach', submitted: 'Yesterday', minutesAgo: 1440, type: 'Edit', status: 'pending' },
  { id: 'w7', name: 'Ava Martinez', handle: 'AvaM', initials: 'AM', color: '#4d3b7a', page: 'Join: Sac State Overwatch', summary: 'Requests a spot on the team as a support player.', school: 'Sacramento State', submitted: 'Yesterday', minutesAgo: 1500, type: 'Join team', status: 'pending' },
  { id: 'w8', name: 'Liam Nguyen', handle: 'LiamN', initials: 'LN', color: '#1d5a6e', page: 'Join: UC Davis League', summary: 'Requests to join the roster as a substitute jungler.', school: 'UC Davis', submitted: 'Yesterday', minutesAgo: 1620, type: 'Join team', status: 'pending' },
  { id: 'w9', name: 'Chloe Park', handle: 'ChloeP', initials: 'CP', color: '#5a3b2e', page: 'UC Berkeley Valorant', summary: 'New team page with roster and match schedule.', school: 'UC Berkeley', submitted: '2 days ago', minutesAgo: 2880, type: 'New page', status: 'pending' },
  { id: 'w10', name: 'Marcus Reed', handle: 'MReed', initials: 'MR', color: '#2f6b3d', page: 'SFSU Esports Club', summary: 'Fixes meeting times and adds officer contacts.', school: 'San Francisco State', submitted: '2 days ago', minutesAgo: 3000, type: 'Edit', status: 'pending' },
  { id: 'w11', name: 'Hana Sato', handle: 'HanaS', initials: 'HS', color: '#6e2a2a', page: 'Join: UCSB Valorant', summary: 'Requests to join as an initiator main.', school: 'UC Santa Barbara', submitted: '3 days ago', minutesAgo: 4320, type: 'Join team', status: 'pending' },
  { id: 'w12', name: 'Diego Flores', handle: 'DFlores', initials: 'DF', color: '#3a4f7a', page: 'UCSC Slug Esports', summary: 'Creates club history page with founding sources.', school: 'UC Santa Cruz', submitted: '3 days ago', minutesAgo: 4400, type: 'New page', status: 'pending' },
];

export function initials(name) {
  const caps = name.match(/[A-Z]/g) || [];
  return (caps.length >= 2 ? caps.slice(0, 2).join('') : name.slice(0, 2)).toUpperCase();
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function formatNumber(n) {
  return n.toLocaleString('en-US');
}
