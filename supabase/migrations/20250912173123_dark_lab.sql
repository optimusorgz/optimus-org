/*
  # Update event registrations table

  1. New Columns
    - `checked_in` (boolean) - Whether attendee has checked in at event
    - `custom_answers` (jsonb) - Store answers to custom registration questions

  2. Indexes
    - Add index on checked_in for scanner queries
    - Add index on event_id and user_id combination

  3. Notes
    - checked_in defaults to false
    - custom_answers stores dynamic form responses as JSON
*/

-- Add checked_in column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'checked_in'
  ) THEN
    ALTER TABLE public.event_registrations ADD COLUMN checked_in boolean DEFAULT false;
  END IF;
END $$;

-- Add custom_answers column if it doesn't exist (already exists in your schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'custom_answers'
  ) THEN
    ALTER TABLE public.event_registrations ADD COLUMN custom_answers jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_checked_in ON public.event_registrations (checked_in);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_user ON public.event_registrations (event_id, user_id);