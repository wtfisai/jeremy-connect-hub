-- Remove all conflicting public access policies from profiles table
-- Keep only secure policies that properly restrict sensitive data

-- Remove all existing SELECT policies that allow public access to email
DROP POLICY IF EXISTS "Public access to basic profile data" ON public.profiles;
DROP POLICY IF EXISTS "Public profile info without email" ON public.profiles;
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON public.profiles;

-- Keep only the secure policies:
-- 1. Users can view their own complete profile (including email)
-- 2. Admins can view all profiles (including email)

-- The application will handle any public profile display needs 
-- by querying only non-sensitive columns when appropriate

-- Also fix newsletter subscribers table - remove public access completely
DROP POLICY IF EXISTS "Authenticated users can view subscriber stats" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscribers;

-- Only keep admin access to newsletter data
-- Newsletter subscriber emails should only be accessible to admins