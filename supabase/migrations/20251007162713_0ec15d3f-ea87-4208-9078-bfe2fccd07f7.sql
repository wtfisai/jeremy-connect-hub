-- Fix analytics_events table security
-- Block public read access to prevent data harvesting while maintaining tracking functionality

-- Drop the existing broad admin policy and replace with more specific ones
DROP POLICY IF EXISTS "Admin can view all analytics" ON public.analytics_events;

-- Block all anonymous SELECT access to prevent competitors from harvesting user data
CREATE POLICY "Block anonymous select on analytics_events"
ON public.analytics_events
FOR SELECT
TO anon
USING (false);

-- Allow anonymous INSERT so the track-analytics edge function can continue working
CREATE POLICY "Allow anonymous insert for tracking"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow admins to view all analytics data
CREATE POLICY "Admins can view all analytics events"
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

-- Allow admins to manage analytics data (UPDATE/DELETE if needed)
CREATE POLICY "Admins can manage analytics events"
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