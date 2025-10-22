/*
  # Organization Members and Posts System

  1. New Tables
    - `organization_members`
      - `id` (uuid, primary key)
      - `organisation_id` (uuid, foreign key to organizations)
      - `user_id` (uuid, foreign key to users)
      - `role` (text: main_organiser, organiser, pending)
      - `joined_at` (timestamp)
      - `invited_by` (uuid, foreign key to users)
    
    - `posts` (updated structure)
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, foreign key to users)
      - `organisation_id` (uuid, foreign key to organizations)
      - `image_url` (text, optional)
      - `created_at` (timestamp)

  2. Schema Updates
    - Add `invite_token` to organizations table
    - Add `avatar_url` to organizations table

  3. Functions
    - `generate_org_invite_token(org_id)` - generates secure invite token
    - `join_organization_by_token(invite_token, user_id)` - joins org via invite
    - `approve_member(org_id, member_user_id, approver_user_id)` - approves pending members

  4. Security
    - Enable RLS on all new tables
    - Add policies for organization members and posts
    - Ensure only main organizers can approve members
*/

-- Add new columns to organizations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'invite_token'
  ) THEN
    ALTER TABLE organizations ADD COLUMN invite_token uuid DEFAULT gen_random_uuid();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE organizations ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'pending' CHECK (role IN ('main_organiser', 'organiser', 'pending')),
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organisation_id, user_id)
);

-- Update posts table structure (drop and recreate to ensure clean structure)
DROP TABLE IF EXISTS posts CASCADE;

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_members
CREATE POLICY "Members can view their organization members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = organization_members.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('main_organiser', 'organiser')
    )
  );

CREATE POLICY "Main organizers can manage members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = organization_members.organisation_id
      AND om.user_id = auth.uid()
      AND om.role = 'main_organiser'
    )
  );

CREATE POLICY "Users can join via invite"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'pending');

-- RLS Policies for posts
CREATE POLICY "Organization members can view posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = posts.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('main_organiser', 'organiser')
    )
  );

CREATE POLICY "Organization members can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = posts.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('main_organiser', 'organiser')
    )
  );

CREATE POLICY "Authors and main organizers can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = posts.organisation_id
      AND om.user_id = auth.uid()
      AND om.role = 'main_organiser'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organisation_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_posts_organisation_id ON posts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

-- Function to generate organization invite token
CREATE OR REPLACE FUNCTION generate_org_invite_token(org_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token uuid;
  is_main_organiser boolean;
BEGIN
  -- Check if the current user is the main organizer
  SELECT EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organisation_id = org_id
    AND om.user_id = auth.uid()
    AND om.role = 'main_organiser'
  ) INTO is_main_organiser;

  IF NOT is_main_organiser THEN
    RAISE EXCEPTION 'Only main organizers can generate invite tokens';
  END IF;

  -- Generate new token
  new_token := gen_random_uuid();
  
  -- Update organization with new invite token
  UPDATE organizations 
  SET invite_token = new_token 
  WHERE id = org_id;
  
  RETURN new_token;
END;
$$;

-- Function to join organization by token
CREATE OR REPLACE FUNCTION join_organization_by_token(invite_token uuid, joining_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
  org_name text;
  existing_member boolean;
BEGIN
  -- Find organization by invite token
  SELECT id, name INTO org_id, org_name
  FROM organizations
  WHERE organizations.invite_token = join_organization_by_token.invite_token;

  IF org_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Invalid invite token');
  END IF;

  -- Check if user is already a member
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organisation_id = org_id AND user_id = joining_user_id
  ) INTO existing_member;

  IF existing_member THEN
    RETURN json_build_object('success', false, 'message', 'You are already a member of this organization');
  END IF;

  -- Add user as pending member
  INSERT INTO organization_members (organisation_id, user_id, role, invited_by)
  VALUES (org_id, joining_user_id, 'pending', NULL);

  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully joined organization as pending member',
    'organization_name', org_name
  );
END;
$$;

-- Function to approve member
CREATE OR REPLACE FUNCTION approve_member(org_id uuid, member_user_id uuid, approver_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_main_organiser boolean;
  member_exists boolean;
BEGIN
  -- Check if approver is main organizer
  SELECT EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organisation_id = org_id
    AND om.user_id = approver_user_id
    AND om.role = 'main_organiser'
  ) INTO is_main_organiser;

  IF NOT is_main_organiser THEN
    RETURN json_build_object('success', false, 'message', 'Only main organizers can approve members');
  END IF;

  -- Check if member exists and is pending
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organisation_id = org_id 
    AND user_id = member_user_id 
    AND role = 'pending'
  ) INTO member_exists;

  IF NOT member_exists THEN
    RETURN json_build_object('success', false, 'message', 'Member not found or already approved');
  END IF;

  -- Approve member
  UPDATE organization_members
  SET role = 'organiser', joined_at = now()
  WHERE organisation_id = org_id AND user_id = member_user_id;

  RETURN json_build_object('success', true, 'message', 'Member approved successfully');
END;
$$;

-- Function to get organization members
CREATE OR REPLACE FUNCTION get_organization_members(org_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role text,
  joined_at timestamptz,
  user_name text,
  user_email text,
  user_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this organization
  IF NOT EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organisation_id = org_id
    AND om.user_id = auth.uid()
    AND om.role IN ('main_organiser', 'organiser')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    om.id,
    om.user_id,
    om.role,
    om.joined_at,
    p.name as user_name,
    u.email as user_email,
    p.avatar_url as user_avatar
  FROM organization_members om
  JOIN users u ON om.user_id = u.id
  LEFT JOIN profiles p ON om.user_id = p.user_id
  WHERE om.organisation_id = org_id
  ORDER BY 
    CASE om.role 
      WHEN 'main_organiser' THEN 1
      WHEN 'organiser' THEN 2
      WHEN 'pending' THEN 3
    END,
    om.joined_at DESC;
END;
$$;

-- Trigger to auto-create main organizer when organization is created
CREATE OR REPLACE FUNCTION create_main_organizer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the organization owner as main organizer
  INSERT INTO organization_members (organisation_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'main_organiser', now());
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_main_organizer ON organizations;
CREATE TRIGGER trigger_create_main_organizer
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_main_organizer();