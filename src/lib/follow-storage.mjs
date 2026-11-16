// Never import the legacy shared key: its owner is unknown.
const key = (userId) => `cq-following:${userId}`;

export function readFollows(storage, userId, defaults) {
  try {
    const saved = JSON.parse(storage.getItem(key(userId)));
    if (Array.isArray(saved) && saved.every((id) => typeof id === 'string')) return saved;
  } catch { /* Storage unavailable or malformed: use defaults. */ }
  return defaults;
}

export function saveFollows(storage, userId, following) {
  try { storage.setItem(key(userId), JSON.stringify(following)); }
  catch { /* Following still works in memory when storage is blocked. */ }
}
