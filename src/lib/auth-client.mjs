// Keep browser requests on Next's origin so the API rewrite carries both cookies.
export async function authPost(action, body) {
  const csrf = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
  if (!csrf.ok) throw new Error('Unable to initialize secure session.');
  const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('csrftoken='))?.slice('csrftoken='.length);
  if (!token) throw new Error('CSRF cookie is missing.');
  return fetch(`/api/auth/${action}`, {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': decodeURIComponent(token) },
    body: JSON.stringify(body ?? {}),
  });
}

export function userProfile(user) {
  return {
    ...user, realName: user.name, gamertag: user.gamertag || user.name || user.email,
    initials: (user.gamertag || user.name || user.email).slice(0, 2).toUpperCase(),
    school: user.school || '', team: '', game: '', position: '', rank: '', peakRank: '',
    pronouns: '', bio: '', banner: '/images/profile-banner.jpg', online: true,
    followers: 0, friends: 0, endorsement: 0, interests: [], achievements: [], posts: [],
  };
}
