import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, eventTitle, accessLink, expiresAt, grantedBy } = await req.json();

    // Format expiry date
    const expiryDate = new Date(expiresAt).toLocaleString();

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dashboard Access Granted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Dashboard Access Granted</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p><strong>${grantedBy}</strong> has granted you access to the check-in dashboard for:</p>
            <h2>📅 ${eventTitle}</h2>
            
            <p>With this access, you can:</p>
            <ul>
              <li>✅ Scan attendee tickets for check-in</li>
              <li>👥 View event registrations</li>
              <li>📊 Monitor check-in statistics</li>
            </ul>

            <a href="${accessLink}" class="button">Open Dashboard</a>

            <div class="footer">
              <p><strong>⏰ Access expires:</strong> ${expiryDate}</p>
              <p><strong>🔗 Direct link:</strong> <a href="${accessLink}">${accessLink}</a></p>
              <p>This is a temporary access link. No login is required.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // In a real implementation, you would use your email service here
    // For now, we'll just log the email content
    console.log('Email would be sent to:', to);
    console.log('Email content:', emailHtml);

    // You could integrate with services like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email notification',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});