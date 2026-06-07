-- Migration v2: switch platforms to direct sending_rate / receiving_rate
-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql

-- Step 1: Add new rate columns (idempotent)
alter table platforms add column if not exists sending_rate  numeric;
alter table platforms add column if not exists receiving_rate numeric;

-- Step 2: Clear old margin-derived values (rates start fresh as null)
-- sending_rate and receiving_rate are already null after column creation

-- Step 3: Insert USD corridor platforms (idempotent — skips if already present)
insert into platforms (corridor, platform_id, name, color, active, margin, type, sending_rate, receiving_rate)
select v.corridor, v.platform_id, v.name, v.color, true, 0, 'both', null, null
from (values
  ('USD-NGN', 'wise',         'Wise',          '#4ade80'),
  ('USD-NGN', 'lemfi',        'LemFi',         '#f59e0b'),
  ('USD-NGN', 'remitly',      'Remitly',       '#f87171'),
  ('USD-NGN', 'worldremit',   'WorldRemit',    '#a78bfa'),
  ('USD-NGN', 'sendwave',     'Sendwave',      '#34d399'),
  ('USD-NGN', 'westernunion', 'Western Union', '#fbbf24'),
  ('USD-GHS', 'wise',         'Wise',          '#4ade80'),
  ('USD-GHS', 'lemfi',        'LemFi',         '#f59e0b'),
  ('USD-GHS', 'remitly',      'Remitly',       '#f87171'),
  ('USD-GHS', 'worldremit',   'WorldRemit',    '#a78bfa'),
  ('USD-GHS', 'sendwave',     'Sendwave',      '#34d399'),
  ('USD-GHS', 'westernunion', 'Western Union', '#fbbf24'),
  ('NGN-USD', 'wise',         'Wise',          '#4ade80'),
  ('NGN-USD', 'lemfi',        'LemFi',         '#f59e0b'),
  ('NGN-USD', 'remitly',      'Remitly',       '#f87171'),
  ('NGN-USD', 'worldremit',   'WorldRemit',    '#a78bfa'),
  ('NGN-USD', 'westernunion', 'Western Union', '#fbbf24'),
  ('GHS-USD', 'wise',         'Wise',          '#4ade80'),
  ('GHS-USD', 'lemfi',        'LemFi',         '#f59e0b'),
  ('GHS-USD', 'remitly',      'Remitly',       '#f87171'),
  ('GHS-USD', 'worldremit',   'WorldRemit',    '#a78bfa'),
  ('GHS-USD', 'westernunion', 'Western Union', '#fbbf24')
) as v(corridor, platform_id, name, color)
where not exists (
  select 1 from platforms p
  where p.corridor = v.corridor and p.platform_id = v.platform_id
);
