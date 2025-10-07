-- ============================================
-- CRITICAL SECURITY FIX: Migrate to Supabase Auth with Role-Based Access
-- This migration creates a proper role-based access control system
-- and deprecates the insecure admin_users table
-- ============================================

-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: Add policies to user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 5: Update ALL existing RLS policies to use has_role instead of admin_users checks

-- Analytics Events
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can manage analytics" ON public.analytics_events;

CREATE POLICY "Admins can view analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage analytics"
ON public.analytics_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Calendar Settings
DROP POLICY IF EXISTS "Admin can manage calendar settings" ON public.calendar_settings;

CREATE POLICY "Admin can manage calendar settings"
ON public.calendar_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contact Submissions
DROP POLICY IF EXISTS "Admin can view all contact submissions" ON public.contact_submissions;

CREATE POLICY "Admin can view all contact submissions"
ON public.contact_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Premium Messages
DROP POLICY IF EXISTS "Admin can view and update all messages" ON public.premium_messages;

CREATE POLICY "Admin can view and update all messages"
ON public.premium_messages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles - Add admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- CRITICAL: Block anonymous access to profiles table (fixes PUBLIC_USER_DATA warning)
CREATE POLICY "Block anonymous profile access"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Page Views
DROP POLICY IF EXISTS "Admin can view all page views" ON public.page_views;

CREATE POLICY "Admin can view all page views"
ON public.page_views
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User Sessions
DROP POLICY IF EXISTS "Admin can view all sessions" ON public.user_sessions;

CREATE POLICY "Admin can view all sessions"
ON public.user_sessions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 6: Disable the admin_users table (deprecate, don't drop yet for migration period)
-- Remove the conflicting old policies
DROP POLICY IF EXISTS "Admin access only for jeremyw@dobeu.net" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can only view their own record" ON public.admin_users;

-- Add a strict policy that blocks all access (table is now deprecated)
CREATE POLICY "admin_users table deprecated - no access"
ON public.admin_users
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Step 7: Add comment to admin_users table marking it as deprecated
COMMENT ON TABLE public.admin_users IS 'DEPRECATED: This table is no longer used. Admin authentication now uses Supabase Auth with user_roles table. This table will be dropped in a future migration after confirming all admins have migrated.';