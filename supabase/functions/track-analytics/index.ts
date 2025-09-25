import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsEvent {
  event_type: string;
  page_url?: string;
  user_id?: string;
  session_id: string;
  properties?: Record<string, any>;
}

interface PageView {
  page_url: string;
  user_id?: string;
  session_id: string;
  referrer?: string;
  time_on_page?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Simple device detection
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    // Simple browser detection
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Simple OS detection
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    if (endpoint === 'event') {
      const eventData: AnalyticsEvent = await req.json();
      
      console.log('Tracking analytics event:', eventData.event_type);

      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          event_type: eventData.event_type,
          page_url: eventData.page_url,
          user_id: eventData.user_id,
          session_id: eventData.session_id,
          ip_address: clientIP,
          user_agent: userAgent,
          device_type: deviceType,
          browser: browser,
          os: os,
          properties: eventData.properties || {}
        }]);

      if (error) {
        console.error('Error saving analytics event:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (endpoint === 'pageview') {
      const pageViewData: PageView = await req.json();
      
      console.log('Tracking page view:', pageViewData.page_url);

      // Insert page view
      const { error: pageViewError } = await supabase
        .from('page_views')
        .insert([{
          page_url: pageViewData.page_url,
          user_id: pageViewData.user_id,
          session_id: pageViewData.session_id,
          ip_address: clientIP,
          user_agent: userAgent,
          referrer: pageViewData.referrer,
          time_on_page: pageViewData.time_on_page
        }]);

      if (pageViewError) {
        console.error('Error saving page view:', pageViewError);
        throw pageViewError;
      }

      // Create or update session
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', pageViewData.session_id)
        .single();

      if (!existingSession) {
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .insert([{
            session_id: pageViewData.session_id,
            user_id: pageViewData.user_id,
            ip_address: clientIP,
            user_agent: userAgent,
            device_type: deviceType,
            browser: browser,
            os: os
          }]);

        if (sessionError) {
          console.error('Error creating session:', sessionError);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in track-analytics function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to track analytics", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);