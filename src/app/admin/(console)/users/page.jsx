import UserDirectory from './UserDirectory';

// Reads ?q= and ?status= so links from the dashboard open with a filter set.
export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  return <UserDirectory initialQuery={params.q ?? ''} initialStatus={params.status ?? 'all'} />;
}
