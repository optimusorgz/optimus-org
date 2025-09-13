/*
  # Update organizations table structure

  1. Table Updates
    - Ensure proper foreign key relationship with profiles
    - Add unique constraint on name
    - Update RLS policies for organization management

  2. Security
    - Users can insert their own organizations
    - Only admins can update status
    - Public can view approved organizations
*/

-- Add unique constraint on organization name if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_name_unique'
    AND table_name = 'organizations'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_name_unique UNIQUE (name);
  END IF;
END $$;

-- Update foreign key relationship to use user_id instead of profiles.id
DO $$
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_owner_id_fkey'
    AND table_name = 'organizations'
  ) THEN
    ALTER TABLE organizations DROP CONSTRAINT organizations_owner_id_fkey;
  END IF;
  
  -- Add new foreign key constraint
  ALTER TABLE organizations 
  ADD CONSTRAINT organizations_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view approved organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update organization status" ON organizations;

CREATE POLICY "Users can insert their own organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    NOT EXISTS (
      SELECT 1 FROM organizations 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view approved organizations"
  ON organizations
  FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can view their own organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update organization status"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'organiser'
    )
  );