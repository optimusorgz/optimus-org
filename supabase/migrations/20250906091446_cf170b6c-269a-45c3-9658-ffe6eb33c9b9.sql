-- Add is_active field to optimus_applications table
ALTER TABLE optimus_applications ADD COLUMN is_active boolean DEFAULT true;

-- Add questions field to events table for custom registration questions
ALTER TABLE events ADD COLUMN questions jsonb DEFAULT '[]'::jsonb;

-- Add registration_number field to event_registrations
ALTER TABLE event_registrations ADD COLUMN registration_number text;
ALTER TABLE event_registrations ADD COLUMN mobile_number text;
ALTER TABLE event_registrations ADD COLUMN custom_answers jsonb DEFAULT '{}'::jsonb;

-- Create digital_tickets table for QR code tickets
CREATE TABLE public.digital_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES event_registrations(id) ON DELETE CASCADE,
  ticket_number text NOT NULL UNIQUE,
  qr_code_data text NOT NULL,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on digital_tickets
ALTER TABLE digital_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for digital_tickets
CREATE POLICY "Users can view their own tickets" 
ON digital_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" 
ON digital_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_digital_tickets_user_id ON digital_tickets(user_id);
CREATE INDEX idx_digital_tickets_event_id ON digital_tickets(event_id);
CREATE INDEX idx_digital_tickets_registration_id ON digital_tickets(registration_id);