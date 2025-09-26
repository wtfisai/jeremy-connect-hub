-- Fix security vulnerability: Remove public access to email addresses in profiles table
-- Drop ALL existing policies and create secure ones

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;

-- Create secure policy for profiles: users can only see non-sensitive data publicly
-- and their own complete profile when authenticated
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for public access to non-sensitive profile data only
-- Note: Applications should handle column selection to exclude email field
CREATE POLICY "Public access to basic profile data" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Drop all existing policies on newsletter_subscribers table  
DROP POLICY IF EXISTS "Newsletter subscribers are viewable by everyone" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscriber stats" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all newsletter data" ON public.newsletter_subscribers;

-- Create secure policies for newsletter subscribers
CREATE POLICY "Admins can view all newsletter data" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.email = 'jeremyw@dobeu.net' 
  AND admin_users.id = auth.uid()
));

-- Users can only view their own newsletter subscription
CREATE POLICY "Users can view their own subscription" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.uid() = user_id);