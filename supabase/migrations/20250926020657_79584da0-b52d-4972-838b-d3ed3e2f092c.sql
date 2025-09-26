-- SECURITY FIX: Remove the vulnerable RLS policy that allows public access to bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Create secure RLS policies for bookings
-- Policy 1: Authenticated users can only view their own bookings
CREATE POLICY "Authenticated users can view own bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admin users can view all bookings (for admin dashboard)
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = 'jeremyw@dobeu.net' 
    AND admin_users.id = auth.uid()
  )
);

-- Policy 3: Admin users can update booking status
CREATE POLICY "Admins can update bookings" 
ON public.bookings 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = 'jeremyw@dobeu.net' 
    AND admin_users.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = 'jeremyw@dobeu.net' 
    AND admin_users.id = auth.uid()
  )
);

-- Policy 4: Keep the insert policy but make it more secure
-- Remove the old policy first
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create new insert policy that's more restrictive
CREATE POLICY "Public can create bookings with validation" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are present
  name IS NOT NULL AND 
  email IS NOT NULL AND 
  consultation_type IS NOT NULL AND
  -- Limit message length for security
  (message IS NULL OR LENGTH(message) <= 1000)
);