'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SEVERN_TRUSTS, DEFAULT_CATEGORIES, ROTATION_COHORTS } from '@/types';

interface PageEditorProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    content?: string;
    trust_id?: string;
    category_id?: string;
    last_updated_cohort?: string;
    trust?: { short_name: string; slug: string };
    category?: { name: string; slug: string };
  } | null;
  mode?: 'create' | 'edit';
  defaultTrust?: string;
  defaultCategory?: string;
}

export function PageEditor({ page, mode = 'edit', defaultTrust, defaultCategory }: PageEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(page?.title || '');
  const [trustSlug, setTrustSlug] = useState(page?.trust?.slug || defaultTrust || 'uhbw');
  const [categorySlug, setCategorySlug] = useState(page?.category?.slug || defaultCategory || 'getting-started');
  const [cohort, setCohort] = useState(page?.last_updated_cohort || ROTATION_COHORTS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing... what do incoming doctors need to know?',
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Highlight,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
    ],
    content: page?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] px-6 py-4',
      },
    },
    immediatelyRender: false,
  });

  const handleSave = useCallback(async () => {
    if (!editor || !title.trim()) {
      setError('Please add a title.');
      return;
    }

    setSaving(true);
    setError('');
    const content = editor.getHTML();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const excerpt = editor.getText().substring(0, 160);

    if (supabase) {
      // Save to Supabase
      const trust = SEVERN_TRUSTS.find(t => t.slug === trustSlug);
      let trustId: string | undefined;

      if (mode === 'edit' && page?.trust_id) {
        trustId = page.trust_id;
      } else {
        // Find or reference trust
        const { data: trustData } = await supabase
          .from('trusts')
          .select('id')
          .eq('slug', trustSlug)
          .single();
        trustId = trustData?.id;
      }

      if (mode === 'create') {
        const { error: insertError } = await supabase.from('pages').insert({
          title,
          slug,
          content,
          excerpt,
          trust_id: trustId,
          last_updated_cohort: cohort,
          author_id: (await supabase.auth.getUser()).data.user?.id,
          last_editor_id: (await supabase.auth.getUser()).data.user?.id,
        });
        if (insertError) setError(insertError.message);
        else {
          setSaved(true);
          setTimeout(() => router.push(`/wiki/${slug}`), 800);
        }
      } else if (page) {
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            title,
            content,
            excerpt,
            last_updated_cohort: cohort,
            updated_at: new Date().toISOString(),
            last_editor_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq('id', page.id);
        if (updateError) setError(updateError.message);
        else {
          setSaved(true);
          setTimeout(() => router.push(`/wiki/${page.slug}`), 800);
        }
      }
    } else {
      // Fallback: save to localStorage
      localStorage.setItem(`inductionbase-page-${slug}`, JSON.stringify({
        title, slug, content, excerpt, trustSlug, categorySlug, cohort,
        savedAt: new Date().toISOString(),
      }));
      setSaved(true);
    }

    setSaving(false);
  }, [editor, title, trustSlug, categorySlug, cohort, supabase, mode, page, router]);

  if (!editor) return null;

  return (
    <div className="space-y-6">
      {/* Form fields */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ward 7A Survival Guide"
            className="w-full px-4 py-2.5 text-lg font-semibold rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-slate-900"
          />
        </div>

        {/* Trust + Category + Cohort (create mode) */}
        {mode === 'create' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trust</label>
              <select
                value={trustSlug}
                onChange={(e) => setTrustSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-slate-900"
              >
                {SEVERN_TRUSTS.map(t => (
                  <option key={t.slug} value={t.slug}>{t.short_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-slate-900"
              >
                {DEFAULT_CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Updated for Cohort</label>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-slate-900"
              >
                {ROTATION_COHORTS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Cohort (edit mode) */}
        {mode === 'edit' && (
          <div className="max-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Updated for Cohort</label>
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-slate-900"
            >
              {ROTATION_COHORTS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Toolbar */}
        <div className="border-b px-3 py-2 flex flex-wrap gap-1 items-center bg-slate-50">
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >H1</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >H2</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >H3</ToolbarButton>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            ><strong>B</strong></ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            ><em>I</em></ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline"
            ><span className="underline">U</span></ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              title="Highlight"
            ><mark>H</mark></ToolbarButton>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >•≡</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Ordered List"
            >1≡</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive('taskList')}
              title="Checklist"
            >☑</ToolbarButton>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >❝</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="Code Block"
            >{'</>'}</ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('Link URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              active={editor.isActive('link')}
              title="Link"
            >🔗</ToolbarButton>
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >↩</ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >↪</ToolbarButton>
          </ToolbarGroup>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="text-xs text-slate-400 text-right">
        {editor.storage.characterCount.characters()} characters
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Page'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          Cancel
        </button>
        {saved && (
          <span className="text-sm text-green-600">Redirecting...</span>
        )}
      </div>
    </div>
  );
}

// ── Toolbar sub-components ──

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-300 mx-1" />;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded text-sm font-medium transition-colors
        ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}
