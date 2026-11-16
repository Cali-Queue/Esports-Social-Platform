import { Inter, Space_Grotesk } from 'next/font/google';
import styles from './admin.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata = {
  title: 'Admin · Cali Queue',
};

// Wrapper for every /admin page, including sign in.
export default function AdminRootLayout({ children }) {
  return <div className={`${styles.root} ${inter.variable} ${spaceGrotesk.variable}`}>{children}</div>;
}
