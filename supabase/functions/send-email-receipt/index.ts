import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { to, subject, templateData } = await req.json();

    const { name, email, phone, amount, orderId, paymentId, date, eventTitle } = templateData;

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
          h1 { color: #0056b3; text-align: center; }
          .header { background-color: #0056b3; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px 0; }
          .field { margin-bottom: 10px; }
          .field strong { display: inline-block; width: 120px; }
          .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #777; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Registration Receipt</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for registering for ${eventTitle}! Here are your payment details:</p>
            <table>
              <tr><th>Field</th><th>Value</th></tr>
              <tr><td>Name</td><td>${name}</td></tr>
              <tr><td>Email</td><td>${email}</td></tr>
              <tr><td>Phone</td><td>${phone}</td></tr>
              <tr><td>Event Title</td><td>${eventTitle}</td></tr>
              <tr><td>Amount Paid</td><td>₹${amount}</td></tr>
              <tr><td>Order ID</td><td>${orderId}</td></tr>
              <tr><td>Payment ID</td><td>${paymentId}</td></tr>
              <tr><td>Date</td><td>${date}</td></tr>
            </table>
          </div>
          <div class="footer">
            <p>Thank you for registering!</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified Resend email
      to: [to],
      subject: subject,
      html: emailBody,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

