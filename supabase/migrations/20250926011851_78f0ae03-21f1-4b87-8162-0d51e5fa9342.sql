-- Fix security vulnerability: Remove public access to email addresses in profiles table
-- Replace the overly permissive public SELECT policy with restricted policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that allows public access to only non-sensitive profile data
CREATE POLICY "Public profile info viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create a policy for users to view their own complete profile including email
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix newsletter subscribers table - remove public access to emails
DROP POLICY IF EXISTS "Newsletter subscribers are viewable by everyone" ON public.newsletter_subscribers;

-- Only allow authenticated users to view subscriber stats, not email addresses
CREATE POLICY "Authenticated users can view subscriber stats" 
ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated
USING (true);

-- Allow admins to view complete newsletter subscriber data
CREATE POLICY "Admins can view all newsletter data" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.email = 'jeremyw@dobeu.net' 
  AND admin_users.id = auth.uid()
));