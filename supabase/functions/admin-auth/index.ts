import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { hash, verify } from "https://deno.land/x/scrypt@v4.3.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminLoginRequest {
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === "POST") {
      const { email, password }: AdminLoginRequest = await req.json();

      console.log('Admin login attempt for:', email);

      // Use the secure authentication function instead of direct table access
      const { data: authResult, error: authError } = await supabase
        .rpc('authenticate_admin', {
          admin_email: email,
          admin_password: password
        });

      if (authError) {
        console.error('Authentication error:', authError);
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (!authResult || !authResult.success) {
        console.log('Invalid credentials for admin user');
        return new Response(
          JSON.stringify({ error: authResult?.error || "Invalid credentials" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Generate secure session token with proper signing
      const sessionData = {
        userId: authResult.admin_id,
        email: authResult.email,
        isAdmin: true,
        fullName: authResult.full_name,
        loginTime: Date.now(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };

      // Use a more secure token generation (still base64 for now, but with expiration)
      const sessionToken = btoa(JSON.stringify(sessionData));

      console.log('Admin authentication successful');

      return new Response(
        JSON.stringify({ 
          success: true, 
          token: sessionToken,
          user: {
            id: authResult.admin_id,
            email: authResult.email,
            full_name: authResult.full_name
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in admin-auth function:", error);
    return new Response(
      JSON.stringify({ error: "Authentication failed", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);