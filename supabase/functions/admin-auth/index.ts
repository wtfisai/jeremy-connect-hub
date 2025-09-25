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

      // Check if this is the initial password setup
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !adminUser) {
        console.error('Admin user not found:', fetchError);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // If password is placeholder, set the real password
      if (adminUser.password_hash === 'PLACEHOLDER_HASH') {
        console.log('Setting initial password for admin user');
        const hashedPassword = await hash(password);
        
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ 
            password_hash: hashedPassword,
            last_login: new Date().toISOString()
          })
          .eq('email', email);

        if (updateError) {
          console.error('Failed to set password:', updateError);
          return new Response(
            JSON.stringify({ error: "Failed to set password" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        // Create admin session token (simple JWT-like structure)
        const sessionToken = btoa(JSON.stringify({
          userId: adminUser.id,
          email: adminUser.email,
          isAdmin: true,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));

        return new Response(
          JSON.stringify({ 
            success: true, 
            token: sessionToken,
            user: {
              id: adminUser.id,
              email: adminUser.email,
              full_name: adminUser.full_name
            }
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Verify password
      const isValidPassword = await verify(password, adminUser.password_hash);
      
      if (!isValidPassword) {
        console.log('Invalid password for admin user');
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);

      // Create admin session token
      const sessionToken = btoa(JSON.stringify({
        userId: adminUser.id,
        email: adminUser.email,
        isAdmin: true,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      console.log('Admin login successful');

      return new Response(
        JSON.stringify({ 
          success: true, 
          token: sessionToken,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name
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