import { redirect } from 'next/navigation'

// no landing page yet so just send people to signup
export default function Home() {
  redirect('/signup')
}
