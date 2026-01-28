"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailProps {
  to: string;
  subject: string;
  html: string;
  replyTo?: string; // Made optional/dynamic
}

// 🔽 --- UPDATED FOR THE BALANCED PANTRY --- 🔽
const ADMIN_EMAIL = "orders@thebalancedpantry.lk";
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>";
// -------------------------------------------------

export const sendEmail = async ({ to, subject, html, replyTo }: EmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject: subject,
      html: html,
      // Default to Admin email if no specific reply-to is provided
      replyTo: replyTo || ADMIN_EMAIL, 
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};