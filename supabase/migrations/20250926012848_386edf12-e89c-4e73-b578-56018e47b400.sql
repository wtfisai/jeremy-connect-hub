-- CRITICAL SECURITY FIX: Lock down admin_users table completely
-- This table contains sensitive admin credentials and must be protected

-- First, ensure RLS is enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Only specific admin can access admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users are viewable by everyone" ON public.admin_users;
DROP POLICY IF EXISTS "Public access to admin users" ON public.admin_users;

-- Create the most restrictive policy possible
-- Only authenticated users with the specific admin email can access this table
CREATE POLICY "Admin access only for jeremyw@dobeu.net"
ON public.admin_users
FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'jeremyw@dobeu.net'
  )
);

-- Create a security definer function to safely authenticate admin users
-- This allows the admin-auth edge function to work without being blocked by RLS
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Get admin user by email (bypassing RLS due to SECURITY DEFINER)
  SELECT * INTO admin_record 
  FROM admin_users 
  WHERE email = admin_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
  
  -- For initial setup (placeholder password)
  IF admin_record.password_hash = 'PLACEHOLDER_HASH' THEN
    -- Hash and store the new password using bcrypt
    UPDATE admin_users 
    SET password_hash = crypt(admin_password, gen_salt('bf')),
        last_login = now()
    WHERE id = admin_record.id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'admin_id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'setup', true
    );
  END IF;
  
  -- Verify password using bcrypt
  IF admin_record.password_hash = crypt(admin_password, admin_record.password_hash) THEN
    -- Update last login timestamp
    UPDATE admin_users 
    SET last_login = now()
    WHERE id = admin_record.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'admin_id', admin_record.id, 
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'setup', false
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
END;
$$;