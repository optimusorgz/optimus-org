-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add status column to events table if not exists
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_registrations
CREATE POLICY "Users can register for events" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" 
ON public.event_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Event creators can view their event registrations" 
ON public.event_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_registrations.event_id 
    AND events.created_by = auth.uid()
  )
);

-- Update existing RLS policies for profiles to handle role updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow admins to update any profile's role
CREATE POLICY "Admins can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() AND admin_profile.role = 'admin'
  )
);

-- Update events RLS policies
DROP POLICY IF EXISTS "Users can insert events" ON public.events;
CREATE POLICY "Users can insert events with approved org" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE organizations.id = events.organization_id 
    AND organizations.owner_id = auth.uid() 
    AND organizations.status = 'approved'
  )
);

-- Allow only approved events to be visible publicly
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view approved events" 
ON public.events 
FOR SELECT 
USING (status = 'approved');

-- Allow event creators to view their own events regardless of status
CREATE POLICY "Event creators can view their own events" 
ON public.events 
FOR SELECT 
USING (auth.uid() = created_by);

-- Allow admins to view all events
CREATE POLICY "Admins can view all events" 
ON public.events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update event status
CREATE POLICY "Admins can update event status" 
ON public.events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update organizations RLS policies
DROP POLICY IF EXISTS "Admins can update org status" ON public.organizations;
CREATE POLICY "Admins can update org status" 
ON public.organizations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to select all organizations
DROP POLICY IF EXISTS "Admins can select all orgs" ON public.organizations;
CREATE POLICY "Admins can select all orgs" 
ON public.organizations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$function$;