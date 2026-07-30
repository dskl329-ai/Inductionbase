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
        className="w-full px-4 py-3 pl-10 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition text-text text-sm"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg"
      >
        🔍
      </button>
    </form>
  );
}
