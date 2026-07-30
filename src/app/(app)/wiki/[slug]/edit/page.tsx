import { PageEditor } from '@/components/wiki/PageEditor';

export default async function EditWikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Editing: {slug}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Page editor will be live once Supabase is connected.
        </p>
      </div>
      <PageEditor page={null} />
    </div>
  );
}
