/*
  # Organization Invite System

  1. New Tables
    - `organization_members` - Track organization membership with roles
    - `posts` - Organization posts with author tracking
  
  2. Table Updates
    - Add `invite_token` to organizations table
    - Add `photo` and `organisation` to profiles table
  
  3. Functions
    - `generate_org_invite_token` - Generate secure invite links
    - `join_organization_by_token` - Join org via invite
    - `approve_member` - Approve pending members
    - `get_organization_members` - Get org members with details
  
  4. Security
    - Enable RLS on all new tables
    - Add policies for organization access control
    - Ensure only main organizers can approve members
*/

-- Add invite_token to organizations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'invite_token'
  ) THEN
    ALTER TABLE organizations ADD COLUMN invite_token UUID;
  END IF;
END $$;

-- Add photo and organisation to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'photo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organisation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organisation TEXT;
  END IF;
END $$;

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('main_organiser', 'organiser', 'pending')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Create posts table (if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Function to generate organization invite token
CREATE OR REPLACE FUNCTION generate_org_invite_token(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token UUID;
BEGIN
  -- Generate new UUID token
  new_token := gen_random_uuid();
  
  -- Update organization with new invite token
  UPDATE organizations 
  SET invite_token = new_token 
  WHERE id = org_id 
  AND owner_id = auth.uid();
  
  -- Return the token as text
  RETURN new_token::TEXT;
END;
$$;

-- Function to join organization by token
CREATE OR REPLACE FUNCTION join_organization_by_token(
  invite_token TEXT,
  joining_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_record RECORD;
  existing_member RECORD;
BEGIN
  -- Find organization by invite token
  SELECT id, name, owner_id INTO org_record
  FROM organizations 
  WHERE invite_token = invite_token::UUID
  AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid or expired invite link');
  END IF;
  
  -- Check if user is already a member
  SELECT id INTO existing_member
  FROM organization_members 
  WHERE organisation_id = org_record.id 
  AND user_id = joining_user_id;
  
  IF FOUND THEN
    RETURN json_build_object('success', false, 'message', 'You are already a member of this organization');
  END IF;
  
  -- Add user as pending member
  INSERT INTO organization_members (organisation_id, user_id, role)
  VALUES (org_record.id, joining_user_id, 'pending');
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully joined organization. Awaiting approval.',
    'organization_name', org_record.name
  );
END;
$$;

-- Function to approve member
CREATE OR REPLACE FUNCTION approve_member(
  org_id UUID,
  member_user_id UUID,
  approver_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_record RECORD;
BEGIN
  -- Check if approver is the main organizer
  SELECT id, name INTO org_record
  FROM organizations 
  WHERE id = org_id 
  AND owner_id = approver_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Only the main organizer can approve members');
  END IF;
  
  -- Update member role to organiser
  UPDATE organization_members 
  SET role = 'organiser'
  WHERE organisation_id = org_id 
  AND user_id = member_user_id 
  AND role = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Member not found or already approved');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Member approved successfully');
END;
$$;

-- Function to get organization members with details
CREATE OR REPLACE FUNCTION get_organization_members(org_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.id,
    om.user_id,
    om.role,
    om.joined_at,
    p.name as user_name,
    u.email as user_email,
    p.photo as user_avatar
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

-- RLS Policies for organization_members
CREATE POLICY "Members can view their organization members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organisation_id = organization_members.organisation_id
      AND om2.user_id = auth.uid()
      AND om2.role IN ('main_organiser', 'organiser')
    )
  );

CREATE POLICY "Users can join organizations via invite"
  ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Main organizers can update member roles"
  ON organization_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_members.organisation_id
      AND o.owner_id = auth.uid()
    )
  );

-- RLS Policies for posts (update existing)
DROP POLICY IF EXISTS "Author can delete own post" ON posts;
DROP POLICY IF EXISTS "Author can update own post" ON posts;
DROP POLICY IF EXISTS "Public can read posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;

CREATE POLICY "Organization members can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = posts.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('main_organiser', 'organiser')
    )
  );

CREATE POLICY "Public can read posts"
  ON posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authors and main organizers can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = posts.organisation_id
      AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authors and main organizers can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = posts.organisation_id
      AND o.owner_id = auth.uid()
    )
  );

-- Update organizations policies to include members
DROP POLICY IF EXISTS "Users can select their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can select their own orgs" ON organizations;

CREATE POLICY "Organization members can view their org"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organisation_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('main_organiser', 'organiser')
    )
  );

-- Trigger to auto-add owner as main organiser when org is created
CREATE OR REPLACE FUNCTION add_owner_as_main_organiser()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO organization_members (organisation_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'main_organiser');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_add_owner_as_main_organiser ON organizations;
CREATE TRIGGER trigger_add_owner_as_main_organiser
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_main_organiser();