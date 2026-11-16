'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Shared logic for the 4 setup steps:
//  - loads the logged-in user's profile so the step can pre-fill its fields
//  - submit(fields) saves them to Django, then goes to the next step
// Each step keeps its own field state; this only handles talking to the server.
export default function useSetupStep(nextHref) {
  const router = useRouter();
  const [profile, setProfile] = useState(null); // null until loaded
  const [errors, setErrors] = useState({}); // per-field messages from Django
  const [formError, setFormError] = useState(''); // errors not tied to one field
  const [saving, setSaving] = useState(false); // disables the button while saving

  // load the profile once when the step opens
  useEffect(() => {
    fetch('/api/profile/me')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) setProfile(data.profile);
        else if (res.status === 401) setFormError("You're not logged in. Log in, then come back to finish setup.");
        else setFormError(data.detail || "Couldn't load your profile.");
      })
      .catch(() => setFormError("Can't reach the server. Check your connection and try again."));
  }, []);

  // saves only the fields this step owns, then moves on
  async function submit(fields) {
    if (saving) return; // ignore double clicks
    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      // Django rejects PATCHes without a CSRF token. this sets the csrftoken cookie, then we read it
      await fetch('/api/auth/csrf');
      const csrfToken = document.cookie.split('; ').find((c) => c.startsWith('csrftoken='))?.split('=')[1] ?? '';

      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push(nextHref);
        return;
      }
      // 400 = field errors (shown under each field), 401 = not logged in
      if (res.status === 400 && data.errors) setErrors(data.errors);
      else setFormError(data.detail || 'Something went wrong. Please try again.');
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    }
    setSaving(false);
  }

  return { profile, errors, formError, saving, submit };
}
