import { AdminProvider } from '../_components/AdminProvider';
import Sidebar from '../_components/Sidebar';
import styles from '../admin.module.css';

// Sidebar + content for the signed-in admin pages (Dashboard, Users, Wiki Approvals).
// (console) is a route group so it doesn't show up in the URL.
// TODO(backend): redirect to /admin/login when there is no staff session.
export default function ConsoleLayout({ children }) {
  return (
    <AdminProvider>
      <div className={styles.console}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </AdminProvider>
  );
}
