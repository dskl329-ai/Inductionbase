import { PageEditor } from '@/components/wiki/PageEditor';
import { createClient } from '@/lib/supabase/server';

export default async function EditWikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: any = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('pages')
      .select('*, trust:trusts(*), category:categories(*)')
      .eq('slug', slug)
      .single();
    page = data;
  } catch {
    // Supabase not configured — use placeholder
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {page ? `Editing: ${page.title}` : `Editing: ${slug}`}
        </h1>
        {page && (
          <p className="text-sm text-slate-500 mt-1">
            {page.trust?.short_name} · {page.category?.name}
          </p>
        )}
      </div>
      <PageEditor page={page} mode="edit" />
    </div>
  );
}
