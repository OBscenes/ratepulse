-- Allow the service role (and any authenticated user) full access to platforms.
-- Belt-and-suspenders: the service role bypasses RLS regardless, but this
-- ensures anon reads also work if the service role key is ever missing.

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow anon read" ON platforms;
DROP POLICY IF EXISTS "Allow service role full access" ON platforms;
DROP POLICY IF EXISTS "platforms_public_read" ON platforms;

-- Allow anyone (including anon) to read platform rows
CREATE POLICY "platforms_public_read"
  ON platforms
  FOR SELECT
  USING (true);

-- Allow authenticated/service role full write access
CREATE POLICY "platforms_service_write"
  ON platforms
  FOR ALL
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');
