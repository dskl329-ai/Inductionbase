import Link from 'next/link';
import { TipsSection } from '@/components/wiki/TipsSection';
import { CommentSection } from '@/components/wiki/CommentSection';

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6 flex-wrap">
        <Link href="/dashboard" className="hover:text-text">Dashboard</Link>
        <span>/</span>
        <span className="text-text">{slug}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">{slug}</h1>
          </div>
          <Link
            href={`/wiki/${slug}/edit`}
            className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition"
          >
            ✏️ Edit
          </Link>
        </div>
      </div>

      {/* Content placeholder */}
      <article className="prose prose-slate max-w-none mb-12 bg-surface rounded-xl border p-8">
        <div className="text-center py-12 text-text-muted">
          <p className="text-4xl mb-3">📝</p>
          <p>This page will load from Supabase once the database is set up.</p>
          <p className="text-sm mt-2">Connect Supabase in .env.local to enable full functionality.</p>
        </div>
      </article>

      {/* Tips Section */}
      <div className="mb-12">
        <TipsSection pageId={slug} />
      </div>

      {/* Comments */}
      <div className="mb-8">
        <CommentSection pageId={slug} />
      </div>
    </div>
  );
}
