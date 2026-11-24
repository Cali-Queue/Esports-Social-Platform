import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSearchQuery, MAX_SEARCH_LENGTH } from '../src/lib/search-query.mjs';

test('trims leading and trailing spaces', () => {
  assert.deepEqual(checkSearchQuery('   jake  '), { query: 'jake', error: '' });
  assert.deepEqual(checkSearchQuery('   '), { query: '', error: '' });
  assert.deepEqual(checkSearchQuery(undefined), { query: '', error: '' });
});

test('allows letters, numbers and inner spaces', () => {
  assert.equal(checkSearchQuery('Team 42 Alpha').error, '');
});

test('rejects any other character', () => {
  for (const value of ['jake!', "o'neil", 'a_b', 'jake%', 'josé', '<script>']) {
    assert.match(checkSearchQuery(value).error, /letters, numbers, and spaces/, value);
  }
});

test('limits the query to 40 characters after trimming', () => {
  assert.equal(MAX_SEARCH_LENGTH, 40);
  assert.equal(checkSearchQuery('a'.repeat(40)).error, '');
  assert.equal(checkSearchQuery(`  ${'a'.repeat(40)}  `).error, '');
  assert.match(checkSearchQuery('a'.repeat(41)).error, /40 characters or fewer/);
});
