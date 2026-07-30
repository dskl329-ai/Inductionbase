import { notFound } from 'next/navigation';
import { SEVERN_TRUSTS, DEFAULT_CATEGORIES } from '@/types';
import Link from 'next/link';
import { SearchBar } from '@/components/wiki/SearchBar';

export default async function TrustPage({
  params,
}: {
  params: Promise<{ trustSlug: string }>;
}) {
  const { trustSlug } = await params;

  // Find the trust in hardcoded list
  const trustData = SEVERN_TRUSTS.find(t => t.slug === trustSlug);
  if (!trustData) notFound();

  return (
    <div>
      {/* Trust Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">
            ← All trusts
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{trustData.short_name}</h1>
        <p className="text-slate-600 mt-1">{trustData.name}</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar trustId="" />
      </div>

      {/* Categories (empty — seed data after Supabase setup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEFAULT_CATEGORIES.map((cat) => (
          <div key={cat.slug} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h2 className="font-semibold text-slate-900">{cat.name}</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">{cat.description}</p>
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-3">No pages yet</p>
              <Link
                href={`/wiki/new?trust=${trustSlug}&category=${cat.slug}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Create first page
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick add tip */}
      <div className="mt-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-sm text-amber-800 mb-2">
            💡 Got a quick tip? &quot;Things I wish I&apos;d known&quot; are crowd-sourced from doctors like you.
          </p>
          <p className="text-xs text-amber-600">
            Tips appear on relevant wiki pages and the best ones get promoted to the main content.
          </p>
        </div>
      </div>
    </div>
  );
}
