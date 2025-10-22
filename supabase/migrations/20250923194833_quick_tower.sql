/*
  # Complete Organization-Centric Architecture Refactor

  1. Database Schema Updates
    - Add organisation_uuid to profiles table
    - Add is_staff and staff_name to profiles
    - Add uuid to organizations table
    - Create event_responses table for dynamic form responses
    - Create social interaction tables (likes, comments, shares)
    - Update events table with organisation_uuid and form_schema

  2. Security
    - Enable RLS on all new tables
    - Add organization-based access policies
    - Ensure proper data isolation between organizations

  3. Indexes
    - Add performance indexes for common queries
    - Optimize organization-based lookups
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organisation_uuid uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_staff'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_staff boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'staff_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN staff_name text;
  END IF;
END $$;

-- Add uuid column to organizations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'uuid'
  ) THEN
    ALTER TABLE organizations ADD COLUMN uuid uuid DEFAULT gen_random_uuid();
    
    -- Make uuid unique
    ALTER TABLE organizations ADD CONSTRAINT organizations_uuid_unique UNIQUE (uuid);
  END IF;
END $$;

-- Add organisation_uuid and form_schema to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE events ADD COLUMN organisation_uuid uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'form_schema'
  ) THEN
    ALTER TABLE events ADD COLUMN form_schema jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create event_responses table
CREATE TABLE IF NOT EXISTS event_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Update posts table to use organisation_uuid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE posts ADD COLUMN organisation_uuid uuid;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE event_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_responses
CREATE POLICY "Users can insert their own responses"
  ON event_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event creators can view responses"
  ON event_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_responses.event_id
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own responses"
  ON event_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can manage their own likes"
  ON likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
  ON likes
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for comments
CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for shares
CREATE POLICY "Users can manage their own shares"
  ON shares
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view shares"
  ON shares
  FOR SELECT
  TO public
  USING (true);

-- Update posts policies for organization-based access
DROP POLICY IF EXISTS "Users can insert posts for their organization" ON posts;
CREATE POLICY "Users can insert posts for their organization"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.organisation_uuid = posts.organisation_uuid
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organisation_uuid ON profiles(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_events_organisation_uuid ON events(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_posts_organisation_uuid ON posts(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_user_id ON event_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON shares(post_id);

-- Add foreign key constraints for organization relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_organisation_uuid_fkey'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_organisation_uuid_fkey 
    FOREIGN KEY (organisation_uuid) REFERENCES organizations(uuid) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_organisation_uuid_fkey'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT events_organisation_uuid_fkey 
    FOREIGN KEY (organisation_uuid) REFERENCES organizations(uuid) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_organisation_uuid_fkey'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_organisation_uuid_fkey 
    FOREIGN KEY (organisation_uuid) REFERENCES organizations(uuid) ON DELETE CASCADE;
  END IF;
END $$;

-- Update existing data to use new structure (if needed)
-- This is a one-time migration to move existing organization relationships
UPDATE profiles 
SET organisation_uuid = (
  SELECT uuid FROM organizations 
  WHERE organizations.owner_id = profiles.user_id
)
WHERE organisation_uuid IS NULL 
AND EXISTS (
  SELECT 1 FROM organizations 
  WHERE organizations.owner_id = profiles.user_id
);

-- Update events to use organisation_uuid
UPDATE events 
SET organisation_uuid = (
  SELECT uuid FROM organizations 
  WHERE organizations.id = events.organization_id
)
WHERE organisation_uuid IS NULL 
AND organization_id IS NOT NULL;

-- Update posts to use organisation_uuid
UPDATE posts 
SET organisation_uuid = (
  SELECT uuid FROM organizations 
  WHERE organizations.id = posts.organisation_id
)
WHERE organisation_uuid IS NULL 
AND organisation_id IS NOT NULL;