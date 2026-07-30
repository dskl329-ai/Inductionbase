// Types for Inductionbase

export interface Trust {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  region: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  trust_id?: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'contributor';
  bio?: string;
  created_at: string;
}

export interface Category {
  id: string;
  trust_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  icon?: string;
  created_at: string;
}

export interface WikiPage {
  id: string;
  trust_id: string;
  category_id?: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  author_id?: string;
  last_editor_id?: string;
  view_count: number;
  is_published: boolean;
  last_updated_cohort?: string;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category;
  author?: Profile;
  last_editor?: Profile;
}

export interface PageVersion {
  id: string;
  page_id: string;
  content: string;
  title: string;
  editor_id?: string;
  change_summary?: string;
  version_number: number;
  created_at: string;
  // joined
  editor?: Profile;
}

export interface Tip {
  id: string;
  page_id: string;
  author_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  is_promoted: boolean;
  is_verified: boolean;
  created_at: string;
  // joined
  author?: Profile;
  user_vote?: number; // -1, 0, 1
}

export interface Comment {
  id: string;
  page_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  // joined
  author?: Profile;
  replies?: Comment[];
}

// Severn trusts (hardcoded for now, in DB later)
export const SEVERN_TRUSTS: Pick<Trust, 'slug' | 'name' | 'short_name' | 'region'>[] = [
  { slug: 'uhbw', name: 'University Hospitals Bristol and Weston NHS Foundation Trust', short_name: 'UHBW', region: 'Severn' },
  { slug: 'nbt', name: 'North Bristol NHS Trust', short_name: 'NBT', region: 'Severn' },
  { slug: 'ruh', name: 'Royal United Hospitals Bath NHS Foundation Trust', short_name: 'RUH Bath', region: 'Severn' },
  { slug: 'ghft', name: 'Gloucestershire Hospitals NHS Foundation Trust', short_name: 'Gloucestershire', region: 'Severn' },
  { slug: 'ydh', name: 'Yeovil District Hospital NHS Foundation Trust', short_name: 'Yeovil', region: 'Severn' },
  { slug: 'gwh', name: 'Great Western Hospitals NHS Foundation Trust', short_name: 'GWH Swindon', region: 'Severn' },
];

export const DEFAULT_CATEGORIES: { name: string; slug: string; icon: string; description: string }[] = [
  { name: 'Getting Started', slug: 'getting-started', icon: '🚀', description: 'First-day essentials: ID badges, parking, IT logins, mess codes' },
  { name: 'Wards', slug: 'wards', icon: '🏥', description: 'Ward layouts, nurse stations, phlebotomy, discharge lounges' },
  { name: 'Theatres', slug: 'theatres', icon: '🔪', description: 'Theatre locations, list times, anaesthetic rooms, equipment' },
  { name: 'IT Systems', slug: 'it-systems', icon: '💻', description: 'E-referrals, ICE, PACS, clinical noting, remote access' },
  { name: 'On-call', slug: 'on-call', icon: '📟', description: 'Bleep numbers, handover times, escalation paths, crash team' },
  { name: 'Rota', slug: 'rota', icon: '📅', description: 'Rota contacts, leave requests, exception reporting, LTFT' },
  { name: 'Mess & Facilities', slug: 'mess', icon: '☕', description: 'Mess location, facilities code, showers, bike storage, food' },
  { name: 'Useful Contacts', slug: 'contacts', icon: '📞', description: 'Key bleeps, extensions, departmental secretaries, lab numbers' },
  { name: 'Local Protocols', slug: 'protocols', icon: '📋', description: 'Referral pathways, MDT schedules, local guidelines, common prescriptions' },
  { name: 'Education & Teaching', slug: 'education', icon: '📚', description: 'Teaching schedules, journal clubs, exam prep, study leave' },
];

export const ROTATION_COHORTS = [
  'February 2026', 'August 2026', 'February 2027', 'August 2027', 'February 2028', 'August 2028',
];
