-- Fix analytics_events table security - comprehensive fix
-- Block public read access to prevent data harvesting while maintaining tracking functionality

-- Drop ALL existing policies on analytics_events to start fresh
DROP POLICY IF EXISTS "Admin can view all analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Block anonymous select on analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow anonymous insert for tracking" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can manage analytics events" ON public.analytics_events;

-- 1. Block all anonymous SELECT access to prevent competitors from harvesting user data
CREATE POLICY "Block anonymous read access"
ON public.analytics_events
FOR SELECT
TO anon
USING (false);

-- 2. Allow anonymous INSERT so the track-analytics edge function can continue working
CREATE POLICY "Allow tracking inserts"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Allow admins to view all analytics data
CREATE POLICY "Admins can view analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.email = 'jeremyw@dobeu.net'
    AND admin_users.id = auth.uid()
  )
);

-- 4. Allow admins to manage analytics data (UPDATE/DELETE if needed)
CREATE POLICY "Admins can manage analytics"
ON public.analytics_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.email = 'jeremyw@dobeu.net'
    AND admin_users.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.email = 'jeremyw@dobeu.net'
    AND admin_users.id = auth.uid()
  )
);