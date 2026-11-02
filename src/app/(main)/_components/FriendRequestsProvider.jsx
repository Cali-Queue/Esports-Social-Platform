'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CURRENT_USER_HANDLE } from '../_data/mockPlayers';
import { initialFriendRequests, pendingBetween, relationship } from '../_data/friendRequests';

// Shares friend requests between the profile buttons, the nav badge and /notifications.
// Saved in localStorage so a sent request survives a refresh until the API exists.
// TODO(backend): load from GET /api/friend-requests and call
//   POST /api/friend-requests            { to }
//   POST /api/friend-requests/:id/accept | /decline | /cancel
const STORAGE_KEY = 'cq-friend-requests';
const FriendRequestsContext = createContext(null);

export function FriendRequestsProvider({ children }) {
  const [requests, setRequests] = useState(initialFriendRequests);
  const [ready, setReady] = useState(false);
  const me = CURRENT_USER_HANDLE;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) setRequests(saved);
    } catch {
      // private mode or bad data, keep the defaults
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // storage blocked, requests just won't survive a refresh
    }
  }, [requests, ready]);

  // same rules as FriendRequest.send() on the back end
  function sendRequest(to) {
    if (to === me || pendingBetween(requests, me, to)) return false;
    const request = { id: `fr-${Date.now()}`, from: me, to, status: 'pending', createdAt: new Date().toISOString() };
    setRequests([request, ...requests]);
    return true;
  }

  function respond(id, status) {
    setRequests(requests.map((r) => (r.id === id && r.status === 'pending' ? { ...r, status } : r)));
  }

  const value = {
    me,
    ready,
    requests,
    incoming: requests.filter((r) => r.to === me && r.status === 'pending'),
    outgoing: requests.filter((r) => r.from === me && r.status === 'pending'),
    relationshipWith: (handle) => relationship(requests, me, handle),
    pendingWith: (handle) => pendingBetween(requests, me, handle),
    sendRequest,
    accept: (id) => respond(id, 'accepted'),
    decline: (id) => respond(id, 'declined'),
    cancel: (id) => respond(id, 'cancelled'),
  };

  return <FriendRequestsContext.Provider value={value}>{children}</FriendRequestsContext.Provider>;
}

export function useFriendRequests() {
  const context = useContext(FriendRequestsContext);
  if (!context) throw new Error('useFriendRequests must be used inside FriendRequestsProvider');
  return context;
}
