-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_url TEXT,
  user_id UUID,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page views table
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  user_id UUID,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  time_on_page INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions table
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER
);

-- Create premium messages table
CREATE TABLE public.premium_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  priority TEXT DEFAULT 'normal',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact form submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Google Calendar integration settings
CREATE TABLE public.calendar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  google_calendar_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics (admin only)
CREATE POLICY "Admin can view all analytics" ON public.analytics_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

CREATE POLICY "Admin can view all page views" ON public.page_views
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

CREATE POLICY "Admin can view all sessions" ON public.user_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

-- Create RLS policies for premium messages
CREATE POLICY "Users can create premium messages" ON public.premium_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND subscription_tier = 'premium'
  )
);

CREATE POLICY "Users can view their own messages" ON public.premium_messages
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view and update all messages" ON public.premium_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

-- Create RLS policies for contact submissions
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all contact submissions" ON public.contact_submissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

-- Create RLS policies for calendar settings
CREATE POLICY "Admin can manage calendar settings" ON public.calendar_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = 'jeremyw@dobeu.net' AND id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX idx_premium_messages_created_at ON public.premium_messages(created_at);
CREATE INDEX idx_premium_messages_status ON public.premium_messages(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);

-- Create trigger to update updated_at
CREATE TRIGGER update_premium_messages_updated_at
BEFORE UPDATE ON public.premium_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at
BEFORE UPDATE ON public.calendar_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password will be hashed in edge function)
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES ('jeremyw@dobeu.net', 'PLACEHOLDER_HASH', 'Jeremy Williams');