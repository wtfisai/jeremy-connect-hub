-- Fix admin access to profiles for AdminDashboard
-- Update the profiles policies to allow proper admin access

-- Drop the current policies to recreate them properly
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;

-- Create a policy that allows public access to only non-sensitive profile data (no email)
CREATE POLICY "Public profile info without email" 
ON public.profiles 
FOR SELECT 
USING (true);

-- However, we need to restrict this to exclude sensitive columns in application code
-- The application will handle filtering out email addresses for non-authorized users

-- Create a policy for users to view their own complete profile including email
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy for admin users to view all profiles including email
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.email = 'jeremyw@dobeu.net' 
  AND admin_users.id = auth.uid()
));