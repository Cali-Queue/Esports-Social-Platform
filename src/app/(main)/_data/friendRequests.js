// Fake friend requests so the notifications tab has something to show.
// Shape matches accounts.FriendRequest (sender / recipient / status / created_at).
// TODO(backend): replace with GET /api/friend-requests

export const initialFriendRequests = [
  {
    id: 'fr-1',
    from: 'novavex',
    to: 'kairoarc',
    status: 'pending',
    createdAt: '2026-10-31T21:15:00Z',
  },
];

// the pending request between two students, sent by either one
export function pendingBetween(requests, a, b) {
  return requests.find(
    (r) => r.status === 'pending' && ((r.from === a && r.to === b) || (r.from === b && r.to === a)),
  );
}

// what the Add friend button should say on someone's profile
export function relationship(requests, me, other) {
  if (me === other) return 'self';
  const accepted = requests.some(
    (r) => r.status === 'accepted' && ((r.from === me && r.to === other) || (r.from === other && r.to === me)),
  );
  if (accepted) return 'friends';
  const pending = pendingBetween(requests, me, other);
  if (!pending) return 'none';
  return pending.from === me ? 'sent' : 'received';
}

export function timeAgo(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
