'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar({ trustId }: { trustId: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&trust=${trustId}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search pages, tips, protocols..."
        className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-slate-900 text-sm"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
      >
        🔍
      </button>
    </form>
  );
}
