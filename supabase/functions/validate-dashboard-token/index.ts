import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";  // use npm: inside Edge Functions

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("re_V4atVSGZ_2qf3FvqFESNXMfR6CDXKCKh3"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, eventTitle, accessLink, expiresAt, grantedBy } = await req.json();
    const expiryDate = new Date(expiresAt).toLocaleString();

    const emailHtml = `... your same HTML ...`;

    // ✅ Actually send email
    const result = await resend.emails.send({
      from: "noreply@yourdomain.com",   // must be verified in Resend
      to,
      subject: `Access granted to ${eventTitle}`,
      html: emailHtml,
      reply_to: grantedBy || undefined, // optional: replies go back to grantor
    });

    console.log("✅ Email sent:", result);

    return new Response(
      JSON.stringify({ success: true, message: "Email notification sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email notification", success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
