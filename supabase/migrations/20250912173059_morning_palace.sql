/*
  # Add columns to profiles table

  1. New Columns
    - `phone` (text) - User phone number
    - `photo_url` (text) - Profile photo URL
    - `organisation_id` (uuid) - Foreign key to organizations table

  2. Indexes
    - Add index on organisation_id for better query performance

  3. Notes
    - All columns are nullable to maintain backward compatibility
    - organisation_id will be set when user's organization is approved
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organisation_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN organisation_id uuid;
  END IF;
END $$;

-- Add index for organisation_id
CREATE INDEX IF NOT EXISTS idx_profiles_organisation_id ON public.profiles (organisation_id);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_organisation_id_fkey'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_organisation_id_fkey 
    FOREIGN KEY (organisation_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;