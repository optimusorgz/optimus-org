/*
  # Extend profiles table with new columns

  1. New Columns
    - `photo` (text, nullable) - URL for uploaded profile image
    - `organisation` (text, nullable) - Organization name (auto-filled when user registers org)
    - `phone_number` (text, nullable) - User's phone number

  2. Security
    - Maintain existing RLS policies
    - Users can update only their own profile data
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organisation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organisation text;
  END IF;
END $$;

-- phone_number already exists in the schema, so we don't need to add it

-- Update existing RLS policies to include new columns
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);