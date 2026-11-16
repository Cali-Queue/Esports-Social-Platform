export async function currentUser(cookie, backendUrl) {
  const response = await fetch(`${backendUrl}/api/auth/me/`, {
    headers: { Cookie: cookie }, cache: 'no-store',
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Unable to load your session. Please try again.');
  return (await response.json()).user;
}
