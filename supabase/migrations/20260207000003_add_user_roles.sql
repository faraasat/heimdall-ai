-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update RLS policies to allow admins to see all data
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data or admins can view all"
  ON users FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all scans
DROP POLICY IF EXISTS "Users can view their own scans" ON scans;

CREATE POLICY "Users can view their own scans or admins can view all"
  ON scans FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Allow admins to view all findings
DROP POLICY IF EXISTS "Users can view findings from their scans" ON findings;

CREATE POLICY "Users can view findings from their scans or admins can view all"
  ON findings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scans 
      WHERE scans.id = findings.scan_id 
      AND scans.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Comment explaining how to make a user admin
COMMENT ON COLUMN users.role IS 'User role: "user" or "admin". To make a user admin, run: UPDATE users SET role = ''admin'' WHERE email = ''your-email@example.com'';';
