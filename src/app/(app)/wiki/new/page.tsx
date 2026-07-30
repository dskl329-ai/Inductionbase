import { PageEditor } from '@/components/wiki/PageEditor';

export default async function NewWikiPage({
  searchParams,
}: {
  searchParams: Promise<{ trust?: string; category?: string }>;
}) {
  const { trust, category } = await searchParams;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create New Page</h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below and start writing.
        </p>
      </div>
      <PageEditor
        mode="create"
        defaultTrust={trust}
        defaultCategory={category}
        page={null}
      />
    </div>
  );
}
