"use client";

import { useState } from "react";
import styles from "./teams.module.css";

// Only remembers the choice while the page is open.
// Later, this can save the follow to the database.
export default function FollowButton() {
  const [following, setFollowing] = useState(false);

  return (
    <button
      className={`${styles.followButton} ${following ? styles.following : ""}`}
      onClick={() => setFollowing(!following)}
    >
      {following ? "Following" : "Follow school"}
    </button>
  );
}
