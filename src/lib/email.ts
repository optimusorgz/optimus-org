export const sendRegistrationEmail = async (to: string, ticketUid: string, eventTitle: string) => {
  const subject = `Your Ticket for ${eventTitle}`;
  const message = `
    <h2>Registration Successful!</h2>
    <p>Thank you for registering for <strong>${eventTitle}</strong>.</p>
    <p>Your Ticket ID: <strong>${ticketUid}</strong></p>
    <p>Please save this email for entry.</p>
  `;

  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, message }),
  });

  if (!res.ok) {
    // Response is not 2xx
    const text = await res.text(); // read the HTML or error message
    console.error('Email API failed:', text);
    throw new Error(`Failed to send email. Status: ${res.status}`);
  }

  return res.json(); // safe now, because we know it's ok
};
