-- SECURITY FIX: Clean up and recreate all booking policies properly
-- First, drop all existing policies on bookings table
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'bookings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.bookings';
    END LOOP;
END $$;

-- Now create the secure policies from scratch
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

-- Policy 4: Public can create bookings with validation
CREATE POLICY "Public can create bookings with validation" 
ON public.bookings 
FOR INSERT 
TO public
WITH CHECK (
  -- Ensure required fields are present
  name IS NOT NULL AND 
  email IS NOT NULL AND 
  consultation_type IS NOT NULL AND
  -- Limit message length for security
  (message IS NULL OR LENGTH(message) <= 1000)
);