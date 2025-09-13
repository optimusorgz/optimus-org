/*
  # Create Check-in Dashboard Tables

  1. New Tables
    - `event_dashboard_access`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `granted_by` (uuid, foreign key to users)
      - `email` (text)
      - `access_token` (uuid, unique)
      - `expires_at` (timestamp, optional)
      - `created_at` (timestamp)
    - `checkin_logs`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `user_id` (uuid, foreign key to users)
      - `scanned_by` (uuid, foreign key to users)
      - `ticket_code` (text)
      - `action` (text: 'checked_in', 'already_checked_in', 'invalid')
      - `created_at` (timestamp)

  2. Table Updates
    - Add `checked_in` and `checked_in_at` columns to `registrations` table
    - Add `ticket_code` column to `registrations` table

  3. Security
    - Enable RLS on new tables
    - Add policies for access control
    - Create check-in function for secure ticket verification
*/

-- Update registrations table with check-in fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'checked_in'
  ) THEN
    ALTER TABLE registrations ADD COLUMN checked_in boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'checked_in_at'
  ) THEN
    ALTER TABLE registrations ADD COLUMN checked_in_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'ticket_code'
  ) THEN
    ALTER TABLE registrations ADD COLUMN ticket_code uuid DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Create event_dashboard_access table
CREATE TABLE IF NOT EXISTS event_dashboard_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  access_token uuid UNIQUE DEFAULT gen_random_uuid(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create checkin_logs table
CREATE TABLE IF NOT EXISTS checkin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  scanned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ticket_code text NOT NULL,
  action text NOT NULL CHECK (action IN ('checked_in', 'already_checked_in', 'invalid')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_dashboard_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_dashboard_access
CREATE POLICY "Event creators can manage dashboard access"
  ON event_dashboard_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_dashboard_access.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all dashboard access"
  ON event_dashboard_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'organiser'
    )
  );

-- RLS Policies for checkin_logs
CREATE POLICY "Event creators can view checkin logs"
  ON checkin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = checkin_logs.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all checkin logs"
  ON checkin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'organiser'
    )
  );

CREATE POLICY "Anyone can insert checkin logs"
  ON checkin_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create check-in function
CREATE OR REPLACE FUNCTION check_in_attendee(
  p_event_id uuid,
  p_user_id uuid,
  p_scanned_by uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration record;
  v_result json;
BEGIN
  -- Find registration
  SELECT * INTO v_registration
  FROM registrations
  WHERE event_id = p_event_id AND user_id = p_user_id;

  -- Check if registration exists
  IF NOT FOUND THEN
    -- Log invalid attempt
    INSERT INTO checkin_logs (event_id, user_id, scanned_by, ticket_code, action)
    VALUES (p_event_id, p_user_id, p_scanned_by, 'INVALID', 'invalid');
    
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid ticket - no registration found',
      'data', null
    );
  END IF;

  -- Check if already checked in
  IF v_registration.checked_in THEN
    -- Log already checked in attempt
    INSERT INTO checkin_logs (event_id, user_id, scanned_by, ticket_code, action)
    VALUES (p_event_id, p_user_id, p_scanned_by, v_registration.ticket_code::text, 'already_checked_in');
    
    RETURN json_build_object(
      'success', false,
      'message', 'Ticket already used',
      'data', json_build_object(
        'name', v_registration.name,
        'email', v_registration.email,
        'checked_in_at', v_registration.checked_in_at
      )
    );
  END IF;

  -- Mark as checked in
  UPDATE registrations
  SET checked_in = true, checked_in_at = now()
  WHERE id = v_registration.id;

  -- Log successful check-in
  INSERT INTO checkin_logs (event_id, user_id, scanned_by, ticket_code, action)
  VALUES (p_event_id, p_user_id, p_scanned_by, v_registration.ticket_code::text, 'checked_in');

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully checked in',
    'data', json_build_object(
      'name', v_registration.name,
      'email', v_registration.email,
      'checked_in_at', now()
    )
  );
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_dashboard_access_token ON event_dashboard_access(access_token);
CREATE INDEX IF NOT EXISTS idx_event_dashboard_access_event_id ON event_dashboard_access(event_id);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_event_id ON checkin_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_code ON registrations(ticket_code);
CREATE INDEX IF NOT EXISTS idx_registrations_event_user ON registrations(event_id, user_id);