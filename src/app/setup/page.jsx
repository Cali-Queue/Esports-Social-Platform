import Link from 'next/link';
import StepCard from './_components/StepCard';
import BioAccountStep from './_components/BioAccountStep';
import SchoolStep from './_components/SchoolStep';
import TeamGamesStep from './_components/TeamGamesStep';
import InterestsStep from './_components/InterestsStep';
import styles from './setup.module.css';

export const metadata = { title: 'Set up your profile · Cali Queue' };

const steps = [
  { number: '01', title: 'Bio & account', description: 'Avatar, banner, bio, real name', Form: BioAccountStep },
  { number: '02', title: 'School', description: 'Campus, graduation year, verification', Form: SchoolStep },
  { number: '03', title: 'Team & games', description: 'Current team and main game', Form: TeamGamesStep },
  { number: '04', title: 'Interests', description: 'Discovery topics and community goals', Form: InterestsStep },
];

// One page for the whole flow: ?step=1..4 picks the current step,
// earlier steps show as complete and later ones as up next.
// TODO(backend): current step should come from the user's saved setup progress
export default async function SetupPage({ searchParams }) {
  const { step } = await searchParams;
  const currentIndex = Math.min(Math.max(Number(step) || 1, 1), steps.length) - 1;
  const stepHref = (i) => `/setup?step=${i + 1}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>First-time setup · Step {currentIndex + 1} of {steps.length}</p>
          <h1 className={styles.title}>Make your player page recruitable.</h1>
        </div>
        {/* TODO(backend): save progress before leaving */}
        <Link href="/home" className={`${styles.button} ${styles.ghost}`}>Save and exit</Link>
      </header>

      <div className={styles.progress} aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.number} className={`${styles.progressBar} ${i <= currentIndex ? styles.progressBarDone : ''}`} />
        ))}
      </div>

      <ol className={styles.steps}>
        {steps.map(({ Form, ...s }, i) => (
          <li key={s.number}>
            <StepCard
              {...s}
              status={i < currentIndex ? 'complete' : i === currentIndex ? 'current' : 'next'}
              editHref={stepHref(i)}
              preview={s.number === '01' && (
                // TODO(backend): show the user's real avatar and banner
                <div className={`${styles.media} ${styles.preview}`}>
                  <span className={styles.avatarUpload}>KA</span>
                  <span className={styles.bannerUpload} />
                </div>
              )}
            >
              {/* last step finishes onboarding and goes to the home feed */}
              <Form nextHref={i < steps.length - 1 ? stepHref(i + 1) : '/home'} />
            </StepCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
