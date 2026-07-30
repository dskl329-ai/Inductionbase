import { redirect } from 'next/navigation';

export default function Home() {
  // In production with Supabase, this would check auth and route accordingly.
  // For now, always redirect to dashboard.
  redirect('/dashboard');
}
