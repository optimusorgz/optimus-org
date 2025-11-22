// src/pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

// --- Type for form data ---
interface FormData {
  [key: string]: string | number | boolean | undefined;
  event_title?: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const formData: FormData = req.body || {};

  try {
    // Extract emails safely
    const allEmails = Object.values(formData).filter(
      (value): value is string => typeof value === "string" && value.includes("@")
    );

    const uniqueEmails = [...new Set(allEmails)];

    if (uniqueEmails.length === 0) {
      console.warn("No valid emails found. Skipping email sending.");
      return res.status(200).json({
        success: true,
        message: "No emails to send, but API did not fail.",
      });
    }

    // Create Gmail OAuth2 transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SENDER_EMAIL,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    const eventTitle = formData.event_title || "Event Registration";
    const eventDate = formData.event_date || "Date not provided";
    const eventTime = formData.event_time || "Time not provided";
    const venue = formData.venue || "Venue not provided";

    const formDataHtml = Object.entries(formData)
      .map(([key, value]) => `<b>${key}:</b> ${value}`)
      .join("<br>");

    const emailHtml = `
      <div style="font-family: Arial; font-size: 15px;">
        <h2>🎉 Registration Successful!</h2>
        <p>Thank you for registering for:</p>
        <h3>${eventTitle}</h3>
        <p><b>Event Date:</b> ${eventDate}</p>
        <p><b>Event Time:</b> ${eventTime}</p>
        <p><b>Venue:</b> ${venue}</p>
        <hr />
        <h3>Your Details:</h3>
        <p>${formDataHtml}</p>
        <hr />
        <p>We look forward to seeing you there! 🚀</p>
      </div>
    `;

    // Send emails one by one
    for (const email of uniqueEmails) {
      try {
        await transporter.sendMail({
          from: `Event Registration <${process.env.SENDER_EMAIL}>`,
          to: email as string, // Type assertion fixes TS
          subject: `Registration Successful – ${eventTitle}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Email send failed for:", email, emailError);
        // silently fail
      }
    }

    return res.status(200).json({
      success: true,
      message: "Emails processed (sent or skipped silently).",
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(200).json({
      success: false,
      message: "Server error, but no crash as requested.",
    });
  }
}
