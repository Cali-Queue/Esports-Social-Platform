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
