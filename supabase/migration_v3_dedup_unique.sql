-- Migration v3: remove duplicate platform rows and enforce uniqueness
-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql

-- Step 1: Delete duplicate rows, keeping the one with the smallest id
DELETE FROM platforms a
USING platforms b
WHERE a.id > b.id
  AND a.corridor = b.corridor
  AND a.platform_id = b.platform_id;

-- Step 2: Add unique constraint so duplicates can never be inserted again
ALTER TABLE platforms
  ADD CONSTRAINT platforms_corridor_platform_id_key
  UNIQUE (corridor, platform_id);
