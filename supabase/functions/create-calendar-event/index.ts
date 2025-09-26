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

    const { bookingId, adminId } = await req.json();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Get calendar settings
    const { data: calendarSettings, error: settingsError } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (settingsError || !calendarSettings) {
      throw new Error('Calendar not connected');
    }

    // Check if token needs refresh (similar to check-calendar-availability)
    const now = new Date();
    const expiresAt = new Date(calendarSettings.token_expires_at);
    
    let accessToken = calendarSettings.access_token;

    if (now >= expiresAt && calendarSettings.refresh_token) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: calendarSettings.refresh_token,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        const newExpiresAt = new Date(Date.now() + (refreshData.expires_in * 1000));

        await supabase
          .from('calendar_settings')
          .update({
            access_token: accessToken,
            token_expires_at: newExpiresAt.toISOString(),
          })
          .eq('admin_id', adminId);
      }
    }

    // Create calendar event
    const startTime = new Date(booking.preferred_date);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // 1-hour meeting

    const event = {
      summary: `Consultation: ${booking.consultation_type}`,
      description: `Consultation with ${booking.name}\n\nEmail: ${booking.email}\n\nMessage: ${booking.message || 'No additional message'}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        {
          email: booking.email,
          displayName: booking.name,
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: `consultation-${booking.id}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarSettings.google_calendar_id)}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const calendarData = await calendarResponse.json();

    if (!calendarResponse.ok) {
      console.error('Calendar event creation failed:', calendarData);
      throw new Error('Failed to create calendar event');
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
      })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({ 
        success: true,
        eventId: calendarData.id,
        meetingLink: calendarData.conferenceData?.entryPoints?.[0]?.uri,
        eventLink: calendarData.htmlLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Create calendar event error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});