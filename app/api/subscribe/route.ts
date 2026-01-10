// import { NextRequest, NextResponse } from "next/server";
// import { backendClient } from "@/sanity/lib/backendClient";
// import { sendSubscribeEmail } from "@/lib/sendSubscribeEmail";
// export const runtime = "nodejs";

// // Email templates
// const customerEmailTemplate = (email: string) => `
// <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
//   <div style="text-align: center;">
//     <img src="https://elvynstore.com/logo.png" alt="Elvyn" style="width: 120px; margin-bottom: 20px;">
//   </div>
//   <h2 style="color: #2c3e50; text-align: center;">Welcome to Elvyn!</h2>
//   <p>Hi there,</p>
//   <p>Thank you for subscribing to our newsletter! 🎉</p>
//   <p>Use the same email <strong>${email}</strong> at checkout to avail special offers!</p>
//   <div style="text-align: center; margin: 30px 0;">
//     <a href="https://elvynstore.com" style="background-color: #ff6f61; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Visit Store</a>
//   </div>
//   <p style="color: #888; font-size: 12px; text-align: center;">Team ELVYN</p>
// </div>
// `;

// const adminEmailTemplate = (email: string) => `
// <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
//   <h2 style="color: #2c3e50;">New Subscriber Alert</h2>
//   <p>Hello Admin,</p>
//   <p>A new subscriber has joined your newsletter:</p>
//   <ul>
//     <li><strong>Email:</strong> ${email}</li>
//     <li><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</li>
//   </ul>
//   <br>
//   <p style="color: #888; font-size: 12px;">Elvyn Store Notification System</p>
// </div>
// `;

// interface SubscriberRequest {
//   email?: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body: SubscriberRequest = await req.json();
//     let email = body.email?.trim().toLowerCase();

//     if (!email || !email.includes("@")) {
//       return NextResponse.json({ error: "Invalid email" }, { status: 400 });
//     }

//     // Check if email already exists
//     const existing = await backendClient.fetch(
//       `*[_type == "subscribers" && email == $email][0]`,
//       { email }
//     );

//     if (existing) {
//       return NextResponse.json({ message: "Email already subscribed" });
//     }

//     // Create new subscriber
//     await backendClient.create({
//       _type: "subscribers",
//       email,
//       createdAt: new Date().toISOString(),
//     });

//     // Send welcome email to subscriber
//     try {
//       await sendSubscribeEmail({
//         to: email,
//         subject: "Welcome to Elvyn Store!",
//         html: customerEmailTemplate(email),
//       });
//     } catch (err) {
//       console.error("Failed to send welcome email:", err);
//     }

//     // Send notification email to admin
//     try {
//       await sendSubscribeEmail({
//         to: "",
//         subject: "New Subscriber Alert",
//         html: adminEmailTemplate(email),
//       });
//     } catch (err) {
//       console.error("Failed to send admin notification:", err);
//     }

//     return NextResponse.json({
//       message:
//         "Subscribed successfully! Check your inbox for a welcome email.",
//     });
//   } catch (err) {
//     console.error("Subscriber API error:", err);
//     return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }
