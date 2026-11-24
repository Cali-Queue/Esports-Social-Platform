// Same rules as clean_search_query() in accounts/search_views.py, so the page can
// show the error right away instead of waiting on the server.
export const MAX_SEARCH_LENGTH = 40;
const ALLOWED = /^[A-Za-z0-9 ]*$/;

// returns { query, error }. query is the trimmed text, error is a message or ''
export function checkSearchQuery(raw) {
  const query = (raw ?? '').trim();
  if (query.length > MAX_SEARCH_LENGTH) {
    return { query, error: `Search must be ${MAX_SEARCH_LENGTH} characters or fewer.` };
  }
  if (!ALLOWED.test(query)) {
    return { query, error: 'Search can only contain letters, numbers, and spaces.' };
  }
  return { query, error: '' };
}
