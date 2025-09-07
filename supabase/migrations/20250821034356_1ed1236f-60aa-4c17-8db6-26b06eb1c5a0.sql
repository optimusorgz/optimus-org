-- Add missing fields to events table to match application requirements
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'Online',
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Workshop',
ADD COLUMN IF NOT EXISTS contact_email text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS registration_link text,
ADD COLUMN IF NOT EXISTS organizer_name text NOT NULL DEFAULT '';

-- Rename image_url to banner_url for consistency
ALTER TABLE public.events RENAME COLUMN image_url TO banner_url;

-- Rename price to ticket_price for clarity
ALTER TABLE public.events RENAME COLUMN price TO ticket_price;

-- Rename event_date to start_date and add end_date
ALTER TABLE public.events RENAME COLUMN event_date TO start_date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;