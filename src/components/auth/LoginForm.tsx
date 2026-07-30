'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle magic link callback — exchange code for session
  const handleCallback = useCallback(async () => {
    const code = searchParams?.get('code');
    if (!code || !supabase) return;

    setLoading(true);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      setError('Login link expired or invalid. Please request a new one.');
    } else {
      router.replace('/dashboard');
    }
    setLoading(false);
  }, [searchParams, supabase, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.');
      setLoading(false);
      return;
    }

    // Restrict to NHS email domains
    const allowedDomains = ['nhs.net', 'nhs.uk', 'nhs.scot'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain || !allowedDomains.includes(domain)) {
      setError('Please use your nhs.net or nhs.uk email address.');
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (loginError) {
      setError(loginError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  // Show loading state while processing callback
  if (loading && searchParams?.get('code')) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🔐</div>
          <p className="text-text-secondary">Verifying your login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Welcome to Inductionbase</h1>
          <p className="text-text-secondary">
            The community-powered wiki for NHS doctors.
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-text mb-2">Check your email</h2>
              <p className="text-text-secondary">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-6 text-sm text-primary hover:text-primary"
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <label className="block text-sm font-medium text-text mb-2">
                NHS Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firstname.lastname@nhs.net"
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition text-text"
                required
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-error">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="mt-4 w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Sending link...' : 'Send Magic Link'}
              </button>
              <p className="mt-4 text-xs text-text-secondary text-center">
                Only <code>@nhs.net</code> and <code>@nhs.uk</code> emails are accepted.
                No password needed — we&apos;ll email you a login link.
              </p>
            </form>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-surface/60 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium text-text">Community Maintained</div>
            <div className="text-xs text-text-secondary mt-1">By doctors, for doctors</div>
          </div>
          <div className="bg-surface/60 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-sm font-medium text-text">Always Fresh</div>
            <div className="text-xs text-text-secondary mt-1">Updated each rotation</div>
          </div>
          <div className="bg-surface/60 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-1">🔓</div>
            <div className="text-sm font-medium text-text">Free & Open</div>
            <div className="text-xs text-text-secondary mt-1">No paywalls, ever</div>
          </div>
        </div>
      </div>
    </div>
  );
}
