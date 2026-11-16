'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { USERS, WIKI_SUBMISSIONS } from '../_data/adminData';

// Holds the admin console's state so a change on one page (approving a wiki
// edit, suspending a user) shows up on the others. It resets on a full reload.
// TODO(backend): each setter below should also call the matching admin endpoint.
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [users, setUsers] = useState(USERS);
  const [submissions, setSubmissions] = useState(WIKI_SUBMISSIONS);

  const value = useMemo(() => {
    function updateUser(id, changes) {
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...changes } : u)));
    }

    function decide(id, status) {
      setSubmissions((list) => list.map((s) => (s.id === id ? { ...s, status } : s)));
    }

    return {
      users,
      submissions,
      pendingCount: submissions.filter((s) => s.status === 'pending').length,
      approvedCount: submissions.filter((s) => s.status === 'approved').length,
      clearReview: (id) => updateUser(id, { status: 'active', reviewReason: undefined }),
      suspend: (id) => updateUser(id, { status: 'suspended' }),
      reactivate: (id) => updateUser(id, { status: 'active', inactiveDays: undefined, noticeSent: false }),
      sendNotice: (id) => updateUser(id, { noticeSent: true }),
      approve: (id) => decide(id, 'approved'),
      deny: (id) => decide(id, 'denied'),
      undoDecision: (id) => decide(id, 'pending'),
    };
  }, [users, submissions]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>');
  return context;
}
