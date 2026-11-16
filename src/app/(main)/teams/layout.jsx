import styles from "./teams.module.css";
import SchoolTabs from "./SchoolTabs";
import FollowButton from "./FollowButton";
import { school } from "./schoolData";

// This layout wraps every page inside the teams folder,
// so the banner and tabs stay on top no matter which tab you open.
export default function TeamsLayout({ children }) {
  return (
    <div className={styles.page}>
      {/* School banner */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroAvatar}>{school.initials}</div>
          <div className={styles.heroTitleRow}>
            <h1 className={styles.heroTitle}>{school.name}</h1>
            <span className={`${styles.badge} ${styles.badgeTeal}`}>Verified</span>
          </div>
          <FollowButton />
        </div>
      </section>

      {/* Tabs */}
      <SchoolTabs />

      {/* The current tab's page shows here */}
      {children}
    </div>
  );
}