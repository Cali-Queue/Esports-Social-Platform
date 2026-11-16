'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ user, children }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
        if (!active) return;
        if (response.status === 401) {
          setCurrentUser(null);
          router.replace('/login');
          router.refresh();
        } else if (response.ok) {
          const data = await response.json();
          if (active) { setCurrentUser(data.user); setError(''); }
        } else setError('Unable to load your session. Please reload to try again.');
      } catch {
        if (active) setError('Unable to load your session. Please reload to try again.');
      }
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [pathname, router]);
  if (error) return <p role="alert">{error}</p>;
  if (!currentUser) return <p role="status">Redirecting to login…</p>;
  return <AuthContext.Provider value={currentUser}>{children}</AuthContext.Provider>;
}

export function useUser() { return useContext(AuthContext); }
