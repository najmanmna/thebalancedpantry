// lib/sendSubscribeEmail.ts
"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailProps {
  to: string;
  subject: string;
  html: string;
}

// 🔽 --- PUT YOUR CLIENT'S REAL EMAIL HERE --- 🔽
const CLIENT_REPLY_TO_EMAIL = "orders@elvynstore.com";
// -------------------------------------------------

export const sendSubscribeEmail = async ({ to, subject, html }: EmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    throw new Error("Email provider is not configured.");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Elvyn Store <no-reply@elvynstore.com>",
      to: [to],
      subject: subject,
      html: html,
      
      // 🔽 --- THIS IS THE NEW, CRITICAL LINE --- 🔽
      replyTo: CLIENT_REPLY_TO_EMAIL,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};