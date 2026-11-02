import { Inter, Space_Grotesk } from 'next/font/google';
import styles from './setup.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

// First-time profile setup. No NavBar here — the user hasn't finished onboarding yet.
export default function SetupLayout({ children }) {
  return (
    <div className={`${styles.shell} ${inter.variable} ${spaceGrotesk.variable}`}>
      {children}
    </div>
  );
}
