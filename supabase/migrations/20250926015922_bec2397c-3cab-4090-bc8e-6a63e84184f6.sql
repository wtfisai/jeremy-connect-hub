-- Fix the authenticate_admin function to properly handle bcrypt hashing
-- The issue is that gen_salt and crypt functions need explicit schema reference

CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
    -- Hash and store the new password using bcrypt with explicit extension schema
    UPDATE admin_users 
    SET password_hash = extensions.crypt(admin_password, extensions.gen_salt('bf')),
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
  
  -- Verify password using bcrypt with explicit extension schema
  IF admin_record.password_hash = extensions.crypt(admin_password, admin_record.password_hash) THEN
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
$function$;