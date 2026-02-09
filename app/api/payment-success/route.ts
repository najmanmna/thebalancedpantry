import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { Resend } from "resend";

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "orders@thebalancedpantry.lk"; 
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>";

// --- 1. HELPER: Format Currency ---
const formatMoney = (amount: number) => 
  `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

// --- 2. HELPER: Shared HTML Styles & Structure ---
const generateEmailHtml = (order: any, isCustomer: boolean) => {
  const title = isCustomer ? "Payment Confirmed!" : "✅ Payment Received (Card)";
  const subtitle = isCustomer 
    ? `Thanks for your payment. Your order <strong>#${order.orderNumber}</strong> is now being processed.`
    : `Order <strong>#${order.orderNumber}</strong> has been paid online. Status updated to Processing.`;

  // Generate Product Rows
  const productRows = order.products?.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4A3728;">
        <strong>${item.name || "Product"}</strong><br/>
        <span style="font-size: 12px; color: #888;">${item.bundleTitle || "Standard"}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #4A3728;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #4A3728;">${formatMoney(item.price)}</td>
    </tr>
  `).join("") || "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #F3EFE0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; border: 1px solid #e0e0e0; }
        .header { background-color: #4A3728; padding: 20px; text-align: center; color: #F3EFE0; }
        .content { padding: 30px; color: #4A3728; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        .total-row td { border-top: 2px solid #4A3728; font-weight: bold; padding-top: 10px; }
        .address-box { background: #f9f9f9; padding: 15px; border-radius: 5px; font-size: 14px; margin-top: 20px; line-height: 1.6; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #D64545; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">The Balanced Pantry</h2>
        </div>
        <div class="content">
          <h2 style="color: #D64545; margin-top: 0;">${title}</h2>
          <p style="font-size: 16px; line-height: 1.5;">${subtitle}</p>

          <table class="table">
            <thead>
              <tr style="background-color: #f4f4f4; text-align: left;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
              <tr class="total-row">
                <td colspan="2" style="padding: 12px; text-align: right;">Total Paid:</td>
                <td style="padding: 12px; text-align: right; color: #D64545;">${formatMoney(order.total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="address-box">
            <strong>🚚 Shipping To:</strong><br/>
            ${order.customerName}<br/>
            ${order.address?.line1 || ""}<br/>
            ${order.address?.city || ""}, ${order.address?.district || ""}<br/>
            Phone: ${order.phone}
          </div>

          ${!isCustomer ? `
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://thebalancedpantry.lk/studio/desk/orders" class="btn" style="background-color: #4A3728;">Manage Order</a>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          &copy; 2026 The Balanced Pantry. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // 3. FETCH EXPANDED ORDER DETAILS (Fixed Mappings)
    const query = `
      *[_type == "order" && orderNumber == $orderId][0]{
        _id,
        orderNumber,
        customerName,
        email,
        phone,
        address, 
        total,
        paymentStatus,
        emailSent,
        "products": items[]{
          "name": productName,
          quantity,
          bundleTitle,
          price
        }
      }
    `;

    const order = await backendClient.fetch(query, { orderId });

    if (!order) {
        console.error(`Order ${orderId} not found in Sanity`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. PREVENT DUPLICATES
    if (order.paymentStatus === 'paid' && order.emailSent) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // 5. UPDATE SANITY
    await backendClient.patch(order._id).set({
      status: "processing",
      paymentStatus: "paid",
      emailSent: true
    }).commit();

    // 6. GENERATE HTML
    const customerHtml = generateEmailHtml(order, true);
    const adminHtml = generateEmailHtml(order, false);

    // 7. SEND EMAILS
    await Promise.all([
      // To Customer
      resend.emails.send({
        from: SENDER_EMAIL,
        to: order.email,
        subject: `Payment Confirmed: Order #${orderId}`,
        html: customerHtml
      }),
      // To Admin
      resend.emails.send({
        from: SENDER_EMAIL,
        to: ADMIN_EMAIL,
        subject: `✅ Payment Received: Order #${orderId}`,
        html: adminHtml
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Payment Success Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}