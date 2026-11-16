'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '../../../components/AuthProvider';
import { readFollows, saveFollows } from '../../../lib/follow-storage.mjs';
import { initialFollowing } from '../_data/homeFeed';

// Shares who you follow between the home feed, the Following section and profile pages.
// Saved in localStorage so a follow survives a refresh until the API exists.
// TODO(backend): load from GET /api/following and call POST/DELETE /api/following/:id
const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const user = useUser();
  return <UserFollows key={user.id} userId={user.id}>{children}</UserFollows>;
}

function UserFollows({ children, userId }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setFollowing(readFollows(localStorage, userId, initialFollowing)); }
    catch { /* Browser may block access to localStorage itself. */ }
    setReady(true);
  }, [userId]);

  useEffect(() => {
    if (!ready) return;
    try { saveFollows(localStorage, userId, following); }
    catch { /* Keep in-memory follows when browser storage is blocked. */ }
  }, [following, ready, userId]);

  // newest first so a new follow shows up without opening "View more"
  function toggleFollow(id) {
    setFollowing((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]));
  }

  const value = { following, isFollowing: (id) => following.includes(id), toggleFollow };

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollows() {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollows must be used inside FollowProvider');
  return context;
}
