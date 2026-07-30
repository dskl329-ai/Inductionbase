import { TrustSwitcher } from "@/components/ui/TrustSwitcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Graceful: if no Supabase config yet, show basic nav without user data
  let user: any = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    // Supabase not configured yet — show without auth
  }

  return (
    <>
      <header className="border-b bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-text">
              <span>🏥</span>
              <span className="hidden sm:inline">Inductionbase</span>
            </Link>
            <TrustSwitcher />
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-text-secondary hidden sm:inline">
                {user.email}
              </span>
            )}
            <form action="/auth/signout" method="post">
              <button className="text-sm text-text-secondary hover:text-text transition">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
