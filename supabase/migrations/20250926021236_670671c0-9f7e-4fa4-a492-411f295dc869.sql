-- SECURITY FIX: Ensure no public SELECT access to bookings
-- Add an explicit deny policy for anonymous users

CREATE POLICY "Block anonymous select on bookings" 
ON public.bookings 
FOR SELECT 
TO anon
USING (false);