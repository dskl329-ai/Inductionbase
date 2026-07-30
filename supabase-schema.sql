-- Inductionbase Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable required extensions
create extension if not exists "pg_trgm"; -- for fuzzy text search

-----------------------------------------------------------
-- TRUSTS — each NHS trust gets its own wiki instance
-----------------------------------------------------------
create table public.trusts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,         -- e.g. "uhbw", "nbt"
  name          text not null,                -- e.g. "University Hospitals Bristol and Weston"
  short_name    text not null,                -- e.g. "UHBW"
  region        text default 'Severn',
  logo_url      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-----------------------------------------------------------
-- PROFILES — extended user data (Supabase auth.users handles email/password)
-----------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  trust_id      uuid references public.trusts(id),
  avatar_url    text,
  role          text default 'contributor',   -- admin | editor | contributor
  bio           text,                         -- "ST8 HPB Surgery"
  created_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'contributor');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-----------------------------------------------------------
-- CATEGORIES — pre-loaded wiki sections per trust
-----------------------------------------------------------
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  trust_id      uuid references public.trusts(id) on delete cascade not null,
  name          text not null,                -- "Wards", "Theatres", "IT Systems", "On-call", etc.
  slug          text not null,
  description   text,
  sort_order    int default 0,
  icon          text,                         -- emoji
  created_at    timestamptz default now(),
  unique(trust_id, slug)
);

-----------------------------------------------------------
-- PAGES — the actual wiki content
-----------------------------------------------------------
create table public.pages (
  id            uuid primary key default gen_random_uuid(),
  trust_id      uuid references public.trusts(id) on delete cascade not null,
  category_id   uuid references public.categories(id) on delete set null,
  title         text not null,
  slug          text not null,
  content       text,                         -- TipTap JSON or markdown
  excerpt       text,                         -- short preview for search/cards
  author_id     uuid references public.profiles(id),
  last_editor_id uuid references public.profiles(id),
  view_count    int default 0,
  is_published  boolean default true,
  last_updated_cohort text,                   -- "August 2026"
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(trust_id, slug)
);

-- Full-text search index
create index pages_search_idx on public.pages
  using gin (to_tsvector('english', title || ' ' || coalesce(content, '') || ' ' || coalesce(excerpt, '')));

-----------------------------------------------------------
-- PAGE VERSIONS — full edit history
-----------------------------------------------------------
create table public.page_versions (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid references public.pages(id) on delete cascade not null,
  content       text not null,
  title         text not null,
  editor_id     uuid references public.profiles(id),
  change_summary text,                       -- "Updated bleep numbers for August cohort"
  version_number int not null,
  created_at    timestamptz default now()
);

-----------------------------------------------------------
-- TIPS — Reddit-style "things I wish I'd known" per page
-----------------------------------------------------------
create table public.tips (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid references public.pages(id) on delete cascade not null,
  author_id     uuid references public.profiles(id) not null,
  content       text not null,
  upvotes       int default 1,               -- author auto-upvotes
  downvotes     int default 0,
  is_promoted   boolean default false,       -- promoted to main page content by editor
  is_verified   boolean default false,       -- editor-confirmed
  created_at    timestamptz default now()
);

-----------------------------------------------------------
-- TIP VOTES — track who voted on what
-----------------------------------------------------------
create table public.tip_votes (
  id            uuid primary key default gen_random_uuid(),
  tip_id        uuid references public.tips(id) on delete cascade not null,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  vote          int not null check (vote in (-1, 0, 1)),  -- 1 up, -1 down, 0 neutral
  created_at    timestamptz default now(),
  unique(tip_id, user_id)
);

-----------------------------------------------------------
-- PAGE COMMENTS — threaded discussion
-----------------------------------------------------------
create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid references public.pages(id) on delete cascade not null,
  author_id     uuid references public.profiles(id) not null,
  parent_id     uuid references public.comments(id) on delete cascade,
  content       text not null,
  upvotes       int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-----------------------------------------------------------
alter table public.trusts enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.pages enable row level security;
alter table public.page_versions enable row level security;
alter table public.tips enable row level security;
alter table public.tip_votes enable row level security;
alter table public.comments enable row level security;

-- Trusts: anyone can read
create policy "Trusts are viewable by all authenticated users"
  on public.trusts for select
  using (auth.role() = 'authenticated');

-- Profiles: anyone can read, own can edit
create policy "Profiles are viewable by all authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories: viewable by all authenticated
create policy "Categories are viewable by all authenticated users"
  on public.categories for select
  using (auth.role() = 'authenticated');

-- Pages: viewable by all, editable by authenticated
create policy "Pages are viewable by all authenticated users"
  on public.pages for select
  using (auth.role() = 'authenticated');
create policy "Authenticated users can create pages"
  on public.pages for insert
  with check (auth.role() = 'authenticated');
create policy "Authenticated users can update pages"
  on public.pages for update
  using (auth.role() = 'authenticated');

-- Tips: read/write by authenticated
create policy "Tips are viewable by all authenticated users"
  on public.tips for select
  using (auth.role() = 'authenticated');
create policy "Authenticated users can create tips"
  on public.tips for insert
  with check (auth.role() = 'authenticated');
create policy "Users can update own tips"
  on public.tips for update
  using (auth.uid() = author_id);

-- Tip Votes
create policy "Votes are viewable by all authenticated users"
  on public.tip_votes for select
  using (auth.role() = 'authenticated');
create policy "Users can insert own votes"
  on public.tip_votes for insert
  with check (auth.uid() = user_id);
create policy "Users can update own votes"
  on public.tip_votes for update
  using (auth.uid() = user_id);

-- Comments: read/write by authenticated
create policy "Comments are viewable by all authenticated users"
  on public.comments for select
  using (auth.role() = 'authenticated');
create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.role() = 'authenticated');
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = author_id);

-----------------------------------------------------------
-- FUNCTIONS
-----------------------------------------------------------

-- Vote on a tip (upsert pattern)
create or replace function public.vote_tip(p_tip_id uuid, p_vote int)
returns void as $$
begin
  insert into public.tip_votes (tip_id, user_id, vote)
  values (p_tip_id, auth.uid(), p_vote)
  on conflict (tip_id, user_id)
  do update set vote = p_vote, created_at = now();

  -- Update the tip counts
  update public.tips
  set
    upvotes = (select count(*) from public.tip_votes where tip_id = p_tip_id and vote = 1),
    downvotes = (select count(*) from public.tip_votes where tip_id = p_tip_id and vote = -1)
  where id = p_tip_id;
end;
$$ language plpgsql security definer;

-- Search pages across a trust
create or replace function public.search_pages(p_trust_id uuid, p_query text)
returns table (
  id uuid, title text, slug text, excerpt text, category_id uuid,
  view_count int, updated_at timestamptz, rank real
) as $$
begin
  return query
  select
    p.id, p.title, p.slug, p.excerpt, p.category_id,
    p.view_count, p.updated_at,
    ts_rank(to_tsvector('english', p.title || ' ' || coalesce(p.content, '')), plainto_tsquery('english', p_query)) as rank
  from public.pages p
  where p.trust_id = p_trust_id
    and p.is_published = true
    and to_tsvector('english', p.title || ' ' || coalesce(p.content, '') || ' ' || coalesce(p.excerpt, ''))
        @@ plainto_tsquery('english', p_query)
  order by rank desc, p.view_count desc;
end;
$$ language plpgsql;
