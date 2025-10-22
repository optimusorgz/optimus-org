/*
  # Organization-Centric Architecture Refactor

  1. Database Schema Updates
    - Update profiles table with organisation_uuid and staff fields
    - Simplify organizations table structure
    - Add event_responses table for dynamic form responses
    - Add social interaction tables (likes, comments, shares)
    - Update events table with form_schema support

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control

  3. Changes Made
    - Profiles now store organization membership via organisation_uuid
    - Organizations use uuid as access key
    - Events support dynamic forms via JSONB schema
    - Social features for posts (likes, comments, shares)
*/

-- Update profiles table
DO $$
BEGIN
  -- Add organisation_uuid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organisation_uuid uuid;
  END IF;

  -- Add staff fields
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

-- Update organizations table structure
DO $$
BEGIN
  -- Add uuid column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'uuid'
  ) THEN
    ALTER TABLE organizations ADD COLUMN uuid uuid DEFAULT gen_random_uuid() UNIQUE;
  END IF;
END $$;

-- Update events table
DO $$
BEGIN
  -- Add organisation_uuid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE events ADD COLUMN organisation_uuid uuid;
  END IF;

  -- Add form_schema column
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
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Update posts table
DO $$
BEGIN
  -- Add organisation_uuid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'organisation_uuid'
  ) THEN
    ALTER TABLE posts ADD COLUMN organisation_uuid uuid;
  END IF;
END $$;

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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in same organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organisation_uuid IS NULL OR 
    organisation_uuid IN (
      SELECT organisation_uuid FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for organizations
CREATE POLICY "Public can view approved organizations"
  ON organizations FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organisations.id FROM organizations
      JOIN profiles ON profiles.organisation_uuid = organizations.uuid
      WHERE profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for events
CREATE POLICY "Public can view approved events"
  ON events FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Organization members can view their events"
  ON events FOR SELECT
  TO authenticated
  USING (
    organisation_uuid IN (
      SELECT organisation_uuid FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    organisation_uuid IN (
      SELECT organisation_uuid FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for event_responses
CREATE POLICY "Users can view own responses"
  ON event_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own responses"
  ON event_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for posts
CREATE POLICY "Public can view posts"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Organization members can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    organisation_uuid IN (
      SELECT organisation_uuid FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for likes
CREATE POLICY "Users can view all likes"
  ON likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Users can view all comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for shares
CREATE POLICY "Users can view all shares"
  ON shares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own shares"
  ON shares FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_organisation_uuid ON profiles(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_events_organisation_uuid ON events(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_posts_organisation_uuid ON posts(organisation_uuid);
CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_user_id ON event_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON shares(post_id);