import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Compass,
  Heart,
  Map,
  MessageCircle,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import styles from './landing.module.css';

// Logged-out home page. Every call to action leads to /signup or /login.
// TODO(backend): send logged-in users straight to /home.

const FEATURES = [
  { icon: Newspaper, title: 'Campus feed', text: 'Post clips, match results and scrim requests, and follow the players and teams you care about.' },
  { icon: Compass, title: 'Discover players', text: 'Search players, teams and schools by game, role and who is looking for a team.' },
  { icon: Map, title: 'Esports map', text: 'See every collegiate esports program across California on one interactive map.' },
  { icon: BookOpen, title: 'School wikis', text: 'Each campus gets a page with its teams, rosters, hours, news and upcoming events.' },
  { icon: MessageCircle, title: 'Messages', text: 'Encrypted direct messages, friend requests and privacy controls you set yourself.' },
  { icon: UserRound, title: 'Player profiles', text: 'Show off your games, ranks, achievements and clips in one place recruiters can find.' },
];

const STEPS = [
  { title: 'Verify your college email', text: 'Sign up with your California campus email to get Student status.' },
  { title: 'Build your profile', text: 'Add your gamertag, school, games and what you are looking for.' },
  { title: 'Find your team', text: 'Follow players, join your campus community and get recruited.' },
];

const GAMES = ['Valorant', 'League of Legends', 'Rocket League', 'Overwatch 2', 'Super Smash Bros.', 'Apex Legends'];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>CQ</span>
            Cali Queue
          </Link>
          <nav className={styles.nav} aria-label="Sections">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login" className={styles.ghostButton}>Log in</Link>
            <Link href="/signup" className={styles.primaryButton}>Create account</Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>CALIFORNIA COLLEGE ESPORTS</p>
            <h1 className={styles.heroTitle}>
              Your campus esports scene, <span className={styles.gradientText}>all in one queue.</span>
            </h1>
            <p className={styles.heroLead}>
              Cali Queue connects collegiate players, teams and recruiters across California.
              Share your wins, find a roster spot and keep up with every program in the state.
            </p>
            <div className={styles.heroActions}>
              <Link href="/signup" className={`${styles.primaryButton} ${styles.large}`}>
                Create your account <ArrowRight size={18} />
              </Link>
              <Link href="/login" className={`${styles.ghostButton} ${styles.large}`}>I already have an account</Link>
            </div>
            <p className={styles.heroNote}>
              <ShieldCheck size={15} /> Free for students. A verified California college email is required.
            </p>
          </div>

          {/* Decorative preview of the logged-in feed */}
          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewCard}>
              <div className={styles.previewHead}>
                <span className={`${styles.previewAvatar} ${styles.previewTeam}`}>SG</span>
                <div>
                  <div className={styles.previewName}>Sac State Gold <BadgeCheck size={14} /></div>
                  <div className={styles.previewMeta}>Sacramento State · 2h</div>
                </div>
              </div>
              <p className={styles.previewText}>GG to UC Davis in the NorCal quarterfinals. Semis Saturday at 6pm!</p>
              <div className={styles.previewScore}>
                <span>Sac State</span>
                <strong>2 - 0</strong>
                <span>UC Davis</span>
              </div>
              <div className={styles.previewActions}>
                <span className={styles.liked}><Heart size={14} fill="currentColor" /> 84</span>
                <span><MessageSquare size={14} /> 12</span>
              </div>
            </div>
            <div className={`${styles.previewCard} ${styles.previewSmall}`}>
              <span className={styles.previewAvatar}>MC</span>
              <div>
                <div className={styles.previewName}>Mira Chen</div>
                <div className={styles.previewMeta}>Coach · UC Davis</div>
              </div>
              <span className={styles.previewFollow}>Follow</span>
            </div>
            <div className={`${styles.previewCard} ${styles.previewRecruit}`}>
              <span className={styles.recruitDot} />
              <div>
                <div className={styles.previewName}>Hornet Hive is recruiting</div>
                <div className={styles.previewMeta}>Rocket League · Needs 1 striker</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.games} aria-label="Supported games">
          {GAMES.map((game) => <span key={game} className={styles.gameChip}>{game}</span>)}
        </section>

        <section id="features" className={styles.section}>
          <p className={styles.eyebrow}>WHAT YOU GET</p>
          <h2 className={styles.sectionTitle}>Everything your program needs to be seen</h2>
          <p className={styles.sectionLead}>Create an account to unlock every feature below.</p>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Link key={title} href="/signup" className={styles.featureCard}>
                <span className={styles.featureIcon}><Icon size={22} /></span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureText}>{text}</p>
                <span className={styles.featureLink}>Sign up to start <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section id="how-it-works" className={styles.section}>
          <p className={styles.eyebrow}>HOW IT WORKS</p>
          <h2 className={styles.sectionTitle}>Get in the queue in three steps</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to join your campus community?</h2>
          <p className={styles.ctaText}>It takes a minute with your college email.</p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={`${styles.primaryButton} ${styles.large}`}>Create account <ArrowRight size={18} /></Link>
            <Link href="/login" className={`${styles.ghostButton} ${styles.large}`}>Log in</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© 2026 Cali Queue · Sacramento State Club Esports</span>
        <nav className={styles.footerLinks} aria-label="Account">
          <Link href="/login">Log in</Link>
          <Link href="/signup">Create account</Link>
        </nav>
      </footer>
    </div>
  );
}
