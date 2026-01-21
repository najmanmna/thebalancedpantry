import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "orders@thebalancedpantry.lk";
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // 1. Validate Input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 2. Send Email to Admin
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email, // This allows you to hit "Reply" and email the customer directly
      subject: `New Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}