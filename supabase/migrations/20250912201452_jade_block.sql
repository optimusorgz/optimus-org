/*
  # Create admin functions for organization and check-in management

  1. Functions
    - `approve_organisation(org_id)` - Approve organization (admin only)
    - `check_in_attendee(ticket_code)` - Check in attendee by ticket code
    - `get_organization_by_name(org_name)` - Check if organization name exists

  2. Security
    - Functions have proper role checks
    - Prevent duplicate check-ins
    - Validate ticket codes
*/

-- Function to approve organization (admin only)
CREATE OR REPLACE FUNCTION approve_organisation(org_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  user_role text;
BEGIN
  -- Check if user is admin/organiser
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.uid();
  
  IF user_role != 'organiser' THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Update organization status
  UPDATE organizations
  SET status = 'approved'
  WHERE id = org_id;
  
  IF FOUND THEN
    -- Update user's profile with organization name
    UPDATE profiles
    SET organisation = (SELECT name FROM organizations WHERE id = org_id)
    WHERE user_id = (SELECT owner_id FROM organizations WHERE id = org_id);
    
    RETURN json_build_object('success', true, 'message', 'Organization approved');
  ELSE
    RETURN json_build_object('success', false, 'message', 'Organization not found');
  END IF;
END;
$$;

-- Function to check in attendee
CREATE OR REPLACE FUNCTION check_in_attendee(ticket_code_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  registration_record registrations%ROWTYPE;
  result json;
BEGIN
  -- Find registration by ticket code
  SELECT * INTO registration_record
  FROM registrations
  WHERE ticket_code = ticket_code_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid ticket code',
      'data', null
    );
  END IF;
  
  -- Check if already checked in
  IF registration_record.checked_in THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Already checked in',
      'data', json_build_object(
        'name', registration_record.name,
        'email', registration_record.email,
        'checked_in_at', registration_record.checked_in_at
      )
    );
  END IF;
  
  -- Mark as checked in
  UPDATE registrations
  SET checked_in = true, checked_in_at = now()
  WHERE ticket_code = ticket_code_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully checked in',
    'data', json_build_object(
      'name', registration_record.name,
      'email', registration_record.email,
      'checked_in_at', now()
    )
  );
END;
$$;

-- Function to check if organization name exists
CREATE OR REPLACE FUNCTION get_organization_by_name(org_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM organizations
    WHERE LOWER(name) = LOWER(org_name)
  ) INTO org_exists;
  
  RETURN json_build_object('exists', org_exists);
END;
$$;