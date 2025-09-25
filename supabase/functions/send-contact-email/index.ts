import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    console.log('Received contact form submission:', { name, email, subject });

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([{
        name,
        email,
        subject: subject || 'Contact Form Submission',
        message,
        status: 'new'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save contact submission');
    }

    // Send email to Jeremy
    const emailResponse = await resend.emails.send({
      from: "Contact Form <noreply@resend.dev>",
      to: ["jeremyw@dobeu.net"],
      subject: `New Contact: ${subject || 'Contact Form Submission'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject || 'Contact Form Submission'}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    });

    // Send confirmation email to user
    const confirmationResponse = await resend.emails.send({
      from: "Jeremy Williams <noreply@resend.dev>",
      to: [email],
      subject: "Thank you for your message!",
      html: `
        <h2>Thank you for reaching out, ${name}!</h2>
        <p>I've received your message and will respond within 24 hours.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3>Your Message:</h3>
          <p><strong>Subject:</strong> ${subject || 'Contact Form Submission'}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 10px; border-radius: 3px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <p>Best regards,<br>
        Jeremy Williams<br>
        Supply Chain & Tech Consultant</p>
      `,
    });

    console.log("Emails sent successfully:", { emailResponse, confirmationResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been sent successfully! I'll respond within 24 hours.",
        submissionId: submission.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send message. Please try again later.",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);