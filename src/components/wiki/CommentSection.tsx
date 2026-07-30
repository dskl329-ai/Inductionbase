'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  content: string;
  author?: { full_name?: string; email?: string };
  upvotes: number;
  parent_id?: string;
  created_at: string;
  replies?: Comment[];
}

export function CommentSection({ pageId }: { pageId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Load comments on mount
  useEffect(() => {
    if (supabase) {
      supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('page_id', pageId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .then(({ data }: any) => {
          if (data) setComments(data);
        });
    }
  }, [pageId, supabase]);

  const handleSubmit = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim() || !supabase) return;
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        page_id: pageId,
        author_id: user.user?.id,
        content: text.trim(),
        parent_id: parentId || null,
      })
      .select('*, author:profiles(*)')
      .single();

    if (data) {
      if (parentId) {
        // Add reply to parent
        setComments(prev => prev.map(c =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), data as unknown as Comment] }
            : c
        ));
        setReplyText('');
        setReplyTo(null);
      } else {
        setComments(prev => [data as unknown as Comment, ...prev]);
        setNewComment('');
      }
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text mb-4">💬 Discussion</h3>

      {/* New comment */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ask a question or share feedback about this page..."
          className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none text-sm text-text resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => handleSubmit()}
            disabled={!newComment.trim() || loading}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
          >
            {loading ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-xl border">
          <p className="text-2xl mb-2">💭</p>
          <p className="text-text-secondary text-sm">No comments yet. Start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id}>
              <div className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">
                    {(comment.author?.full_name || comment.author?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text">
                    {comment.author?.full_name || comment.author?.email?.split('@')[0] || 'Anonymous'}
                  </span>
                  <span className="text-xs text-text-muted">· {formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-text mb-3">{comment.content}</p>
                <button
                  onClick={() => setReplyTo(replyTo?.id === comment.id ? null : {
                    id: comment.id,
                    name: comment.author?.full_name || comment.author?.email?.split('@')[0] || 'Anonymous',
                  })}
                  className="text-xs text-text-secondary hover:text-primary transition"
                >
                  {replyTo?.id === comment.id ? 'Cancel reply' : 'Reply'}
                </button>

                {/* Reply form */}
                {replyTo?.id === comment.id && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-primary-light">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${replyTo.name}...`}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none text-sm resize-none"
                      rows={2}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSubmit(comment.id)}
                      disabled={!replyText.trim() || loading}
                      className="mt-2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-6 space-y-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="p-3 bg-cream rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-warning-light flex items-center justify-center text-xs font-bold text-text-secondary">
                            {(reply.author?.full_name || reply.author?.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-text-secondary">
                            {reply.author?.full_name || reply.author?.email?.split('@')[0] || 'Anonymous'}
                          </span>
                          <span className="text-xs text-text-muted">· {formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-sm text-text">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
