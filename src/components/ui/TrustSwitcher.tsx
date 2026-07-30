'use client';

import { createClient } from '@/lib/supabase/client';
import { SEVERN_TRUSTS } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function TrustSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [trusts, setTrusts] = useState(SEVERN_TRUSTS);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const supabase = createClient();

  // Determine active trust from URL
  useEffect(() => {
    const match = pathname.match(/\/trust\/([^/]+)/);
    setActiveSlug(match ? match[1] : null);

    // Fetch trusts from DB if Supabase is connected
    if (supabase) {
      supabase.from('trusts').select('slug,name,short_name').then((result: any) => {
        if (result?.data?.length) setTrusts(result.data);
      });
    }
  }, [pathname, supabase]);

  const handleChange = (slug: string) => {
    router.push(`/trust/${slug}`);
  };

  return (
    <select
      value={activeSlug || ''}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-slate-700 font-medium cursor-pointer focus:ring-2 focus:ring-blue-200 outline-none"
    >
      <option value="" disabled>Select trust</option>
      {trusts.map((t: any) => (
        <option key={t.slug} value={t.slug}>
          {t.short_name || t.name}
        </option>
      ))}
    </select>
  );
}
