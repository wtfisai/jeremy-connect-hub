-- Phase 1: Remove insecure admin authentication system
-- Drop the deprecated admin_users table completely
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Add comment to document the security fix
COMMENT ON TABLE public.user_roles IS 'Secure role-based access control system. Admin authentication now uses Supabase Auth instead of custom password storage.';