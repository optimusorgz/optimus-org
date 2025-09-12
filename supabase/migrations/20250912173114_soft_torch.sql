/*
  # Update events table structure

  1. New Columns
    - `status` (text) - Event approval status (pending, approved, rejected)
    - `is_published` (boolean) - Whether event is publicly visible
    - Ensure `organisation_id` exists

  2. Constraints
    - Add check constraint for valid status values
    - Add foreign key for organisation_id

  3. Indexes
    - Add indexes for filtering and performance

  4. Notes
    - Events are only publicly visible when status='approved' AND is_published=true
*/

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.events ADD COLUMN status text DEFAULT 'pending'::text;
  END IF;
END $$;

-- Add is_published column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.events ADD COLUMN is_published boolean DEFAULT false;
  END IF;
END $$;

-- Ensure organisation_id exists (should be organization_id from your schema)
-- Note: Your schema shows organization_id, keeping that naming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organisation_id'
  ) THEN
    ALTER TABLE public.events ADD COLUMN organisation_id uuid;
  END IF;
END $$;

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_status_check'
  ) THEN
    ALTER TABLE public.events 
    ADD CONSTRAINT events_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events (is_published);
CREATE INDEX IF NOT EXISTS idx_events_organisation_id ON public.events (organisation_id);

-- Add foreign key constraint for organisation_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_organisation_id_fkey'
  ) THEN
    ALTER TABLE public.events 
    ADD CONSTRAINT events_organisation_id_fkey 
    FOREIGN KEY (organisation_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;