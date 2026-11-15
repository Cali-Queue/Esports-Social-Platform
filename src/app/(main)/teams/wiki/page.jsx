import shared from "../teams.module.css"; // panel, wiki tag, info rows, colors (used by every tab)
import styles from "./wiki.module.css"; // styles for this tab only
import { school, schoolInfo, wikiSections } from "../schoolData";

// School Wiki tab: a read-only wiki page for the school.
export default function SchoolWikiPage() {
  return (
    <main className={styles.wikiLayout}>
      {/* Left: table of contents */}
      <aside className={`${shared.panel} ${styles.wikiToc}`}>
        <p className={styles.tocTitle}>On this page</p>
        <ul>
          {wikiSections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Middle: the wiki article */}
      <article className={`${shared.panel} ${styles.wikiArticle}`}>
        <span className={shared.wikiTag}>{school.name}</span>
        <h2 className={styles.wikiTitle}>School Wiki</h2>
        <p className={styles.wikiMeta}>Last updated DATE · by Editor Name</p>

        {wikiSections.map((section) => (
          <section key={section.id} id={section.id} className={styles.wikiSection}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </article>

      {/* Right: quick facts and edit info */}
      <aside className={shared.column}>
        <div className={shared.panel}>
          <p className={styles.tocTitle}>Quick facts</p>
          {schoolInfo.map((row) => (
            <div key={row.label} className={shared.infoRow}>
              <span>{row.label}</span>
              <span className={shared.infoValue}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className={shared.panel}>
          <p className={shared.wikiText}>
            School mods, Captains, and Coaches can propose edits. A School mod approves publishing.
          </p>
          <button className={shared.darkButton}>Suggest correction</button>
        </div>
      </aside>
    </main>
  );
}