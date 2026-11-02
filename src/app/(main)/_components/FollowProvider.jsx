'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initialFollowing } from '../_data/homeFeed';

// Shares who you follow between the home feed, the Following section and profile pages.
// Saved in localStorage so a follow survives a refresh until the API exists.
// TODO(backend): load from GET /api/following and call POST/DELETE /api/following/:id
const STORAGE_KEY = 'cq-following';
const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) setFollowing(saved);
    } catch {
      // private mode or bad data, keep the defaults
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(following));
    } catch {
      // storage blocked, follows just won't survive a refresh
    }
  }, [following, ready]);

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
