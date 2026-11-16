import { requireSession } from '../../../lib/auth';
import { AuthProvider } from '../../../components/AuthProvider';
import LogoutForm from './LogoutForm';

export default async function LogoutPage() {
  const user = await requireSession();
  return <AuthProvider user={user} allowUnverified><LogoutForm /></AuthProvider>;
}
