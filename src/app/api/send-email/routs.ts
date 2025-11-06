import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/api/client';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json();

    // Use Supabase SMTP to send email
    const { error } = await supabase
      .from('emails') // Supabase Email table or use SMTP
      .insert([{ 
        to,
        subject,
        html: message
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to send email.' });
  }
}
