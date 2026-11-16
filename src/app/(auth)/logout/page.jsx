import { requireUser } from '../../../lib/auth';
import { AuthProvider } from '../../../components/AuthProvider';
import LogoutForm from './LogoutForm';

export default async function LogoutPage() {
  const user = await requireUser();
  return <AuthProvider user={user}><LogoutForm /></AuthProvider>;
}
