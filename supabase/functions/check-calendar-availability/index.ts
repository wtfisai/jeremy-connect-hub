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

    const { date, adminId } = await req.json();

    // Get calendar settings
    const { data: calendarSettings, error: settingsError } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (settingsError || !calendarSettings) {
      throw new Error('Calendar not connected');
    }

    // Check if token needs refresh
    const now = new Date();
    const expiresAt = new Date(calendarSettings.token_expires_at);
    
    let accessToken = calendarSettings.access_token;

    if (now >= expiresAt && calendarSettings.refresh_token) {
      // Refresh the token
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

        // Update tokens in database
        await supabase
          .from('calendar_settings')
          .update({
            access_token: accessToken,
            token_expires_at: newExpiresAt.toISOString(),
          })
          .eq('admin_id', adminId);
      }
    }

    // Get busy times for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarSettings.google_calendar_id)}/events?` +
      `timeMin=${startOfDay.toISOString()}&` +
      `timeMax=${endOfDay.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const calendarData = await calendarResponse.json();

    if (!calendarResponse.ok) {
      console.error('Calendar API error:', calendarData);
      throw new Error('Failed to fetch calendar events');
    }

    // Extract busy times
    const busyTimes = calendarData.items?.map((event: any) => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      title: event.summary || 'Busy',
    })) || [];

    // Generate available time slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    const workingHours = [9, 10, 11, 13, 14, 15, 16]; // Skip 12 for lunch

    for (const hour of workingHours) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this slot conflicts with any busy time
      const isConflict = busyTimes.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        
        return (slotStart < busyEnd && slotEnd > busyStart);
      });

      if (!isConflict) {
        availableSlots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          label: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`,
          available: true
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        availableSlots,
        busyTimes: busyTimes.length,
        date 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Calendar availability error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});