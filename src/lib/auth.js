import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { currentUser } from './auth-session.mjs';

export async function requireSession() {
  // Server requests cannot use the browser rewrite; forward its cookies explicitly.
  const user = await currentUser(
    (await cookies()).toString(), process.env.DJANGO_URL || 'http://127.0.0.1:8000',
  );
  if (!user) redirect('/login');
  return user;
}

export async function requireUser() {
  const user = await requireSession();
  if (!user.isEmailVerified) redirect('/check-inbox');
  return user;
}
