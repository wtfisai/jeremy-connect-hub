-- CRITICAL SECURITY FIX: Lock down admin_users table completely
-- This table contains sensitive admin credentials and must be protected

-- Enable RLS on admin_users if not already enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies that might allow public access
DROP POLICY IF EXISTS "Admin users are viewable by everyone" ON public.admin_users;
DROP POLICY IF EXISTS "Public access to admin users" ON public.admin_users;

-- Create a highly restrictive policy that only allows specific admin access
-- Only the specific admin email can access admin_users data
CREATE POLICY "Only specific admin can access admin_users"
ON public.admin_users
FOR ALL
USING (
  -- Only allow access if the current user is the specific admin
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'jeremyw@dobeu.net'
  )
);

-- Create a security definer function to safely check admin authentication
-- This prevents the admin-auth edge function from being blocked by RLS
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result jsonb;
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
    -- Hash and store the new password
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
  
  -- Verify password
  IF admin_record.password_hash = crypt(admin_password, admin_record.password_hash) THEN
    -- Update last login
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