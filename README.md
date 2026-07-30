# Inductionbase 🏥

**Wikipedia-style onboarding for NHS doctors. Free. Community-maintained. No paywalls.**

## What It Solves

Every six months, thousands of doctors rotate into new NHS trusts. The first 2-4 weeks are chaos — finding bleep numbers, ward layouts, consultant preferences, IT logins. This knowledge lives in WhatsApp chats and oral tradition. Inductionbase fixes that.

## How It Works

- **Trust-level wikis** with pre-loaded categories (Wards, Theatres, IT, On-call, Mess, etc.)
- **NHS email gating** — register with your @nhs.net or @nhs.uk email
- **Reddit-style engagement** — upvote/downvote tips, verify useful information
- **Rotation freshness** — pages stamped by cohort, stale content flagged automatically
- **Community-maintained** — anyone can edit, version history tracks everything
- **Mobile-first** — works on your phone between cases

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (magic links, NHS email gating) |
| Editor | TipTap (Notion-style rich text) |
| Hosting | Vercel |
| Mobile | PWA (installable, offline-capable) |

## Getting Started

### Prerequisites

1. **Supabase project** — sign up at [supabase.com](https://supabase.com), create a project
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Settings > API
3. Paste them into `.env.local`

### Database Setup

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor. This creates:
- Tables: `trusts`, `profiles`, `categories`, `pages`, `page_versions`, `tips`, `tip_votes`, `comments`
- Row-Level Security policies
- Full-text search via `pg_trgm`

### Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or manually:

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, magic-link callback
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (app)/            # Authenticated routes
│   │   ├── dashboard/    # Trust selector
│   │   ├── trust/[slug]/ # Trust-level wiki home
│   │   ├── wiki/[slug]/  # Individual page (read)
│   │   │   └── edit/     # Edit page
│   │   └── layout.tsx
│   ├── auth/signout/     # Sign-out route
│   └── page.tsx          # Root redirect
├── components/
│   ├── auth/LoginForm.tsx
│   ├── ui/TrustSwitcher.tsx
│   └── wiki/
│       ├── PageEditor.tsx
│       ├── SearchBar.tsx
│       ├── TipsSection.tsx  # Reddit-style tips feed
│       └── CommentSection.tsx
├── lib/supabase/
│   ├── client.ts         # Browser client
│   └── server.ts         # Server client
├── types/index.ts        # TypeScript types + constants
└── middleware.ts          # Auth guard
```

## Phase Roadmap

- [x] Phase 0: Name + tech decisions
- [ ] Phase 1: Scaffold (this repo)
- [ ] Phase 2: Core features (editor, tips, search)
- [ ] Phase 3: Trust features (multi-trust, rotation freshness)
- [ ] Phase 4: Polish & launch (PWA, content seeding, beta)
- [ ] Phase 5: Scale (analytics, cross-trust, templates)

## Severn Trusts (v1 Target)

- UHBW (University Hospitals Bristol and Weston) 🏠
- NBT (North Bristol NHS Trust)
- RUH Bath (Royal United Hospitals Bath)
- Gloucestershire Hospitals
- Yeovil District Hospital
- Great Western Hospitals (Swindon)

## Built By

Dan Liu — ST8 HPB Surgery, Severn Deanery. Built because the alternative (asking the same questions every rotation) was driving everyone mad.
