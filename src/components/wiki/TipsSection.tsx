'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Tip {
  id: string;
  content: string;
  author?: { full_name?: string; email?: string };
  upvotes: number;
  downvotes: number;
  user_vote?: number;
  is_verified: boolean;
  is_promoted: boolean;
  created_at: string;
}

export function TipsSection({ pageId }: { pageId: string }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Load tips on mount
  useEffect(() => {
    if (supabase) {
      supabase
        .from('tips')
        .select('*, author:profiles(*)')
        .eq('page_id', pageId)
        .order('upvotes', { ascending: false })
        .then(({ data }: any) => {
          if (data) setTips(data);
        });
    }
  }, [pageId, supabase]);

  const handleVote = async (tipId: string, vote: number) => {
    if (!supabase) return;

    // Optimistic update
    setTips(prev => prev.map(t => {
      if (t.id !== tipId) return t;
      const currentVote = t.user_vote || 0;
      const upAdjust = vote === 1 ? 1 : (currentVote === 1 ? -1 : 0);
      const downAdjust = vote === -1 ? 1 : (currentVote === -1 ? -1 : 0);
      return {
        ...t,
        upvotes: t.upvotes + upAdjust,
        downvotes: t.downvotes + downAdjust,
        user_vote: currentVote === vote ? 0 : vote,
      };
    }));

    await supabase.rpc('vote_tip', { p_tip_id: tipId, p_vote: vote });
  };

  const handleSubmitTip = async () => {
    if (!newTip.trim() || !supabase) return;
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tips')
      .insert({
        page_id: pageId,
        author_id: user.user?.id,
        content: newTip.trim(),
      })
      .select('*, author:profiles(*)')
      .single();

    if (data) {
      setTips(prev => [data as unknown as Tip, ...prev]);
      setNewTip('');
      setShowForm(false);
    }
    setLoading(false);
  };

  const score = (tip: Tip) => tip.upvotes - tip.downvotes;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text">💡 Things I Wish I&apos;d Known</h3>
          <p className="text-sm text-text-secondary mt-0.5">
            Crowd-sourced tips from doctors who&apos;ve been here. Upvote the useful ones.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-light text-primary-dark text-sm font-medium rounded-lg hover:bg-primary-light transition"
        >
          + Add Tip
        </button>
      </div>

      {/* New tip form */}
      {showForm && (
        <div className="mb-4 p-4 bg-primary-pale border border-primary/20 rounded-xl">
          <textarea
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            placeholder="e.g. The phlebotomy round starts at 07:15 not 07:30"
            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none text-sm text-text resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleSubmitTip}
              disabled={!newTip.trim() || loading}
              className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
            >
              {loading ? 'Posting...' : 'Post Tip'}
            </button>
            <button
              onClick={() => { setShowForm(false); setNewTip(''); }}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tips list */}
      {tips.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-xl border">
          <p className="text-4xl mb-2">🔰</p>
          <p className="text-text-secondary text-sm">No tips yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map(tip => (
            <div
              key={tip.id}
              className={`bg-surface rounded-xl border p-4 transition ${
                tip.is_promoted ? 'border-success bg-success-light/50' : 'border-border'
              }`}
            >
              <div className="flex gap-3">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleVote(tip.id, 1)}
                    className={`w-8 h-7 flex items-center justify-center rounded text-sm transition ${
                      tip.user_vote === 1
                        ? 'text-primary bg-primary-light'
                        : 'text-text-muted hover:text-primary hover:bg-primary-pale'
                    }`}
                    title="Upvote"
                  >
                    ▲
                  </button>
                  <span className={`text-xs font-bold tabular-nums ${
                    score(tip) > 0 ? 'text-primary' : score(tip) < 0 ? 'text-error' : 'text-text-muted'
                  }`}>
                    {score(tip)}
                  </span>
                  <button
                    onClick={() => handleVote(tip.id, -1)}
                    className={`w-8 h-7 flex items-center justify-center rounded text-sm transition ${
                      tip.user_vote === -1
                        ? 'text-error bg-error-light'
                        : 'text-text-muted hover:text-error hover:bg-error-light'
                    }`}
                    title="Downvote"
                  >
                    ▼
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text leading-relaxed">{tip.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-text-muted">
                      {tip.author?.full_name || tip.author?.email?.split('@')[0] || 'Anonymous'}
                    </span>
                    {tip.is_verified && (
                      <span className="text-xs px-1.5 py-0.5 bg-success-light text-success rounded font-medium">
                        ✓ Verified
                      </span>
                    )}
                    {tip.is_promoted && (
                      <span className="text-xs px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium">
                        📌 Promoted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
