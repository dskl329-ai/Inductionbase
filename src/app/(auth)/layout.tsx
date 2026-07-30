import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="text-2xl">🏥</span>
            <span>Inductionbase</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
