-- RatePulse schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "uuid-ossp";

-- ── votes ──────────────────────────────────────────────────────────────────────
create table if not exists votes (
  id          uuid default gen_random_uuid() primary key,
  corridor    text not null,
  app_id      text not null,
  count       integer not null default 1,
  unique (corridor, app_id)
);

alter table votes enable row level security;
create policy "public read"   on votes for select using (true);
create policy "public insert" on votes for insert with check (true);
create policy "public update" on votes for update using (true);

-- ── expected_rates ─────────────────────────────────────────────────────────────
create table if not exists expected_rates (
  id          uuid default gen_random_uuid() primary key,
  corridor    text not null,
  rate        numeric not null,
  created_at  timestamptz default now()
);

alter table expected_rates enable row level security;
create policy "public read"   on expected_rates for select using (true);
create policy "public insert" on expected_rates for insert with check (true);

-- ── leads ──────────────────────────────────────────────────────────────────────
create table if not exists leads (
  id            uuid default gen_random_uuid() primary key,
  email         text not null unique,
  corridor      text,
  voted_app     text,
  expected_rate numeric,
  created_at    timestamptz default now()
);

alter table leads enable row level security;
create policy "public insert" on leads for insert with check (true);
