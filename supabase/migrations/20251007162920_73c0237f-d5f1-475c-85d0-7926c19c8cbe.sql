-- Fix admin_users table security
-- Add explicit policy to block all anonymous access to admin credentials

-- Block all anonymous SELECT access to prevent exposure of password hashes and emails
CREATE POLICY "Block anonymous access to admin_users"
ON public.admin_users
FOR SELECT
TO anon
USING (false);

-- Also add a more restrictive authenticated policy
-- Only allow admins to view their own record
CREATE POLICY "Admins can only view their own record"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND id = auth.uid()
  AND EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'jeremyw@dobeu.net'
  )
);