-- Update existing events to add missing required fields with default values
UPDATE public.events SET 
  location = COALESCE(location, 'Online'),
  category = COALESCE(category, 'Workshop'),
  contact_email = COALESCE(contact_email, ''),
  organizer_name = COALESCE(organizer_name, 'Optimus Team')
WHERE location IS NULL OR category IS NULL OR contact_email IS NULL OR organizer_name IS NULL;

-- Add missing columns if they don't exist (safe operation)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='location') THEN
    ALTER TABLE public.events ADD COLUMN location text NOT NULL DEFAULT 'Online';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='category') THEN
    ALTER TABLE public.events ADD COLUMN category text NOT NULL DEFAULT 'Workshop';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='contact_email') THEN
    ALTER TABLE public.events ADD COLUMN contact_email text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='contact_phone') THEN
    ALTER TABLE public.events ADD COLUMN contact_phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_link') THEN
    ALTER TABLE public.events ADD COLUMN registration_link text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='organizer_name') THEN
    ALTER TABLE public.events ADD COLUMN organizer_name text NOT NULL DEFAULT 'Optimus Team';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='end_date') THEN
    ALTER TABLE public.events ADD COLUMN end_date timestamp with time zone;
  END IF;
END $$;