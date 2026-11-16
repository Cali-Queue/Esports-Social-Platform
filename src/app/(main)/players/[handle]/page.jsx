import { requireUser } from '../../../../lib/auth';
import { notFound, redirect } from 'next/navigation';
import ProfileView from '../../_components/ProfileView';
import PlayerActions from './PlayerActions';
import { getPlayer } from '../../_data/mockPlayers';

// Another player's profile, e.g. /players/astrazen
export default async function PlayerProfilePage({ params }) {
  const { handle } = await params;
  // your own handle goes to the editable version
  if (handle.toLowerCase() === (await requireUser()).handle?.toLowerCase()) redirect('/profile');

  // TODO(backend): fetch the player from the API instead of mock data
  const player = getPlayer(handle);
  if (!player) notFound();

  return <ProfileView player={player} actions={<PlayerActions handle={player.handle} />} />;
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const player = getPlayer(handle);
  return { title: player ? `${player.gamertag} · Cali Queue` : 'Player not found · Cali Queue' };
}
