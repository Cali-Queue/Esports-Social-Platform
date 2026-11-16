import { requireUser } from '../../lib/auth';
import { AuthProvider } from '../../components/AuthProvider';
import { Inter, Space_Grotesk } from 'next/font/google';
import styles from './setup.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

// First-time profile setup. No NavBar here — the user hasn't finished onboarding yet.
export default async function SetupLayout({ children }) {
  const user = await requireUser();
  return (
    <AuthProvider user={user}>
    <div className={`${styles.shell} ${inter.variable} ${spaceGrotesk.variable}`}>
      {children}
    </div>
    </AuthProvider>
  );
}
