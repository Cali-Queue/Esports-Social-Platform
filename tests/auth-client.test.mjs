import test from 'node:test';
import assert from 'node:assert/strict';
import { authPost, userProfile } from '../src/lib/auth-client.mjs';

test('login and logout use the proxy with cookies and a fresh CSRF token', async () => {
  const originalFetch = global.fetch;
  const originalDocument = global.document;
  try {
    for (const action of ['login', 'logout', 'signup', 'verify-email', 'resend-verification', 'forgot-password', 'reset-password']) {
      const calls = [];
      global.document = { cookie: 'csrftoken=rotated-token; other=value' };
      global.fetch = async (...args) => { calls.push(args); return { ok: true }; };
      await authPost(action, { email: 'player@csus.edu' });
      assert.equal(calls[0][0], '/api/auth/csrf');
      assert.equal(calls[1][0], `/api/auth/${action}`);
      assert.equal(calls[1][1].credentials, 'same-origin');
      assert.equal(calls[1][1].headers['X-CSRFToken'], 'rotated-token');
      assert.equal(calls[1][1].method, 'POST');
    }
    global.fetch = async () => ({ ok: false });
    await assert.rejects(authPost('logout'), /initialize/);
    global.fetch = async () => ({ ok: true });
    global.document.cookie = '';
    await assert.rejects(authPost('logout'), /missing/);
  } finally {
    global.fetch = originalFetch;
    global.document = originalDocument;
  }
});

test('current user identity has no mock profile data', () => {
  const profile = userProfile({ name: 'New Player', email: 'new@csus.edu', handle: 'new', gamertag: null });
  assert.equal(profile.gamertag, 'New Player');
  assert.equal(profile.realName, 'New Player');
  assert.equal(profile.school, '');
  assert.deepEqual(profile.posts, []);
});

test('server session lookup forwards cookies, disables caching, and rejects unauthorized access', async () => {
  const { currentUser } = await import('../src/lib/auth-session.mjs');
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'http://django:8000/api/auth/me/');
      assert.equal(options.headers.Cookie, 'sessionid=existing-session');
      assert.equal(options.cache, 'no-store');
      return { ok: true, json: async () => ({ user: { id: 7 } }) };
    };
    assert.deepEqual(await currentUser('sessionid=existing-session', 'http://django:8000'), { id: 7 });
    global.fetch = async () => ({ status: 401 });
    assert.equal(await currentUser('', 'http://django:8000'), null);
    global.fetch = async () => ({ status: 500, ok: false });
    await assert.rejects(currentUser('', 'http://django:8000'), /Unable to load/);
  } finally { global.fetch = originalFetch; }
});

test('logout page accepts restricted sessions while main guard still requires verification', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('../src/app/(auth)/logout/page.jsx', import.meta.url), 'utf8');
  const guards = await readFile(new URL('../src/lib/auth.js', import.meta.url), 'utf8');
  assert.match(page, /await requireSession\(\)/);
  const session = guards.split('export async function requireUser')[0];
  assert.match(session, /redirect\('\/login'\)/);
  assert.doesNotMatch(session, /isEmailVerified/);
  assert.match(guards, /if \(!user.isEmailVerified\) redirect\('\/check-inbox'\)/);
});

test('switching accounts keeps follow choices isolated and ignores unowned legacy state', async () => {
  const { readFollows, saveFollows } = await import('../src/lib/follow-storage.mjs');
  const values = new Map([['cq-following', '["legacy-player"]']]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.deepEqual(readFollows(storage, 1, []), []);
  saveFollows(storage, 1, ['player-a']);
  assert.deepEqual(readFollows(storage, 2, []), []);
  saveFollows(storage, 2, ['team-b']);
  assert.deepEqual(readFollows(storage, 1, []), ['player-a']);
  assert.deepEqual(readFollows(storage, 2, []), ['team-b']);
  saveFollows(storage, 1, []);
  assert.deepEqual(readFollows(storage, 1, ['default']), []);
  values.set('cq-following:1', 'broken');
  assert.deepEqual(readFollows(storage, 1, ['default']), ['default']);
});

test('logout explicitly permits unverified client refresh while other providers remain restricted', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('../src/app/(auth)/logout/page.jsx', import.meta.url), 'utf8');
  const provider = await readFile(new URL('../src/components/AuthProvider.jsx', import.meta.url), 'utf8');
  assert.match(page, /AuthProvider user=\{user\} allowUnverified/);
  assert.match(provider, /allowUnverified = false/);
  assert.match(provider, /!allowUnverified && !data.user.isEmailVerified/);
  const follows = await readFile(new URL('../src/app/(main)/_components/FollowProvider.jsx', import.meta.url), 'utf8');
  assert.match(follows, /UserFollows key=\{user.id\} userId=\{user.id\}/);
});
