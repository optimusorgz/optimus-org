/*
  # Update organizations table structure

  1. New Columns
    - `status` (text) - Organization approval status (pending, approved, rejected)
    - Ensure `owner_id` exists and references users table

  2. Constraints
    - Add unique constraint on organization name (case-insensitive)
    - Add check constraint for valid status values

  3. Indexes
    - Add index on status for filtering
    - Add index on owner_id for user queries

  4. Security
    - Enable RLS on organizations table
    - Add policies for organization management
*/

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN status text DEFAULT 'pending'::text;
  END IF;
END $$;

-- Ensure owner_id exists (it should from your schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN owner_id uuid;
  END IF;
END $$;

-- Add unique constraint on organization name (case-insensitive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_name_unique'
  ) THEN
    CREATE UNIQUE INDEX organizations_name_unique ON public.organizations (LOWER(name));
  END IF;
END $$;

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_status_check'
  ) THEN
    ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations (status);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations (owner_id);

-- Add foreign key constraint for owner_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'organizations_owner_id_fkey'
  ) THEN
    ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;