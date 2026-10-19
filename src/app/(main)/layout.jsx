import { Inter, Space_Grotesk } from 'next/font/google';
import NavBar from './_components/NavBar';
import styles from './main.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

// Shared wrapper for the logged-in app (profile, feed, discover, etc).
// (main) is a route group so it doesn't show up in the URL.
export default function MainLayout({ children }) {
  return (
    <div className={`${styles.app} ${inter.variable} ${spaceGrotesk.variable}`}>
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
