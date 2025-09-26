import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const adminId = url.searchParams.get('state'); // We'll pass admin ID as state

    if (!code || !adminId) {
      // Step 1: Redirect to Google OAuth
      const redirectUri = `${url.origin}/functions/v1/google-calendar-oauth`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${adminId || 'admin'}`;

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': googleAuthUrl
        }
      });
    }

    // Step 2: Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${url.origin}/functions/v1/google-calendar-oauth`,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      throw new Error('Failed to exchange authorization code for tokens');
    }

    // Get user's calendar info
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const calendarData = await calendarResponse.json();
    const primaryCalendar = calendarData.items?.find((cal: any) => cal.primary) || calendarData.items?.[0];

    if (!primaryCalendar) {
      throw new Error('No calendar found');
    }

    // Store tokens in database
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
    
    const { error } = await supabase
      .from('calendar_settings')
      .upsert([{
        admin_id: adminId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        google_calendar_id: primaryCalendar.id,
        token_expires_at: expiresAt.toISOString(),
      }]);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Redirect back to admin dashboard
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${url.origin}/admin/dashboard?calendar=connected`
      }
    });

  } catch (error) {
    console.error('Google Calendar OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});