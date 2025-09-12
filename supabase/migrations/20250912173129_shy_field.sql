/*
  # Create comprehensive RLS policies

  1. Profiles Table Security
    - Users can insert/update their own profiles
    - Public read access for basic profile info
    - Admin can update roles

  2. Organizations Table Security
    - Users can create organizations
    - Owners can update their organizations
    - Admins can approve/reject organizations
    - Proper read access controls

  3. Events Table Security
    - Public can only see approved & published events
    - Users can create events for approved organizations
    - Event creators and admins can manage events

  4. Event Registrations Security
    - Users can register for events
    - Users can view their own registrations
    - Event creators and admins can view event registrations

  5. Optimus Applications Security
    - Users can submit applications
    - Admins can manage applications
    - Public can check recruitment status
*/

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimus_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_role" ON public.profiles;

DROP POLICY IF EXISTS "organizations_insert_own" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_owner" ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_auth" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_owner" ON public.organizations;

DROP POLICY IF EXISTS "events_select_public_approved" ON public.events;
DROP POLICY IF EXISTS "events_insert_for_approved_org" ON public.events;
DROP POLICY IF EXISTS "events_update_own" ON public.events;
DROP POLICY IF EXISTS "events_admin_update" ON public.events;

DROP POLICY IF EXISTS "registrations_insert_own" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_select_own" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_select_event_creator" ON public.event_registrations;

DROP POLICY IF EXISTS "optimus_applications_admin_update" ON public.optimus_applications;
DROP POLICY IF EXISTS "optimus_applications_insert" ON public.optimus_applications;
DROP POLICY IF EXISTS "optimus_applications_select_any" ON public.optimus_applications;

-- PROFILES POLICIES
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "profiles_select_public"
ON public.profiles FOR SELECT TO public
USING (true);

CREATE POLICY "profiles_admin_update_role"
ON public.profiles FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

-- ORGANIZATIONS POLICIES
CREATE POLICY "organizations_insert_own"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "organizations_update_owner"
ON public.organizations FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "organizations_admin_update"
ON public.organizations FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

CREATE POLICY "organizations_select_auth"
ON public.organizations FOR SELECT TO authenticated
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

CREATE POLICY "organizations_select_approved_public"
ON public.organizations FOR SELECT TO public
USING (status = 'approved');

-- EVENTS POLICIES
CREATE POLICY "events_select_public_approved"
ON public.events FOR SELECT TO public
USING (status = 'approved' AND is_published = true);

CREATE POLICY "events_select_own"
ON public.events FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "events_select_admin"
ON public.events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

CREATE POLICY "events_insert_for_approved_org"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid() AND
  organization_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.organizations o 
    WHERE o.id = organization_id AND o.status = 'approved' AND o.owner_id = auth.uid()
  )
);

CREATE POLICY "events_update_own"
ON public.events FOR UPDATE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "events_admin_update"
ON public.events FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

-- EVENT REGISTRATIONS POLICIES
CREATE POLICY "registrations_insert_own"
ON public.event_registrations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "registrations_select_own"
ON public.event_registrations FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "registrations_select_event_creator"
ON public.event_registrations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_registrations.event_id AND e.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

CREATE POLICY "registrations_update_checkin"
ON public.event_registrations FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_registrations.event_id AND e.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

-- OPTIMUS APPLICATIONS POLICIES
CREATE POLICY "optimus_applications_insert_public"
ON public.optimus_applications FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "optimus_applications_select_public"
ON public.optimus_applications FOR SELECT TO public
USING (true);

CREATE POLICY "optimus_applications_admin_update"
ON public.optimus_applications FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

-- DIGITAL TICKETS POLICIES
CREATE POLICY "digital_tickets_insert_system"
ON public.digital_tickets FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);

CREATE POLICY "digital_tickets_select_own"
ON public.digital_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "digital_tickets_select_event_creator"
ON public.digital_tickets FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = digital_tickets.event_id AND e.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'organiser')
  )
);