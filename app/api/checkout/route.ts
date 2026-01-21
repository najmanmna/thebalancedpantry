import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";

export const runtime = 'edge';

// --- CONFIGURATION ---
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "orders@thebalancedpantry.lk";
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>";
const REPLY_TO_EMAIL = "orders@thebalancedpantry.lk"; 

// Brand Colors
const COLORS = {
  bg: "#F9F9F9",
  card: "#FFFFFF",
  text: "#333333",
  brand: "#4A3728", // Dark Coffee
  accent: "#D9534F", // Soft Red
  border: "#EAEAEA"
};

const BANK_DETAILS = `
  <strong>Bank:</strong> Hatton National Bank (HNB)<br/>
  <strong>Branch:</strong> XXXXXXXXX<br/>
  <strong>Account Name:</strong> TBP Limited<br/>
  <strong>Account No:</strong> xxxxxxxxxxx
`;

// --- EMAIL TEMPLATE GENERATORS ---




// --- MAIN HANDLER ---

export async function POST(req: Request) {
  try {
    if (!process.env.SANITY_API_TOKEN) {
      console.error("❌ Missing SANITY_API_TOKEN");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const body = await req.json();
    const { form, items, total, shippingCost, discountAmount, discountLabel } = body;

    // 1. Input Validation
    const phoneRegex = /^(07[0-9]{8}|947[0-9]{8})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = form.phone ? form.phone.replace(/\D/g, "") : "";

    if (
      !form?.firstName || !form?.lastName || !form?.address || !form?.district || !form?.city ||
      !form?.phone || !form?.email ||
      !Array.isArray(items) || items.length === 0 || typeof total !== "number" ||
      !emailRegex.test(form.email) ||
      !phoneRegex.test(phoneDigits)
    ) {
      return NextResponse.json({ error: "Invalid or missing checkout fields." }, { status: 400 });
    }

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    // 2. Duplicate Check
    const existing = await backendClient.fetch(
      `*[_type == "order" && phone == $phone && total == $total && orderDate > $recent][0]`,
      {
        phone: form.phone,
        total,
        recent: new Date(Date.now() - 1000 * 30).toISOString(),
      }
    );

    if (existing) {
      return NextResponse.json({ error: "Duplicate order detected. Please wait a moment." }, { status: 429 });
    }

    // 3. Fetch Products & Validate Stock
    const productIds = items.map((it: any) => it.product._id);
    
    const freshProducts = await backendClient.fetch(
      `*[_type=="product" && _id in $ids]{
        _id, _rev, name, price, images, bundleOptions, 
        openingStock, stockOut,
        "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0)
      }`,
      { ids: productIds }
    );

    const orderItems = [];

    for (const it of items) {
      const fresh = freshProducts.find((p: any) => p._id === it.product._id);
      
      if (!fresh) {
        return NextResponse.json({ error: `Product not found: ${it.product?._id}` }, { status: 404 });
      }

      if (fresh.availableStock < it.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${fresh.name}. Only ${fresh.availableStock} left.` },
          { status: 409 }
        );
      }

      // Prepare Image
      const rawImage = it.productImage || fresh?.images?.[0];
      let imageForSave = undefined;
      if (rawImage?.asset?._ref || rawImage?.asset?._id) {
         imageForSave = {
            _type: "image",
            asset: { 
               _type: "reference", 
               _ref: rawImage.asset._ref || rawImage.asset._id 
            }
         };
      }

      // Determine Price
      const bundleData = it.bundle || {}; 
      const selectedBundleDB = fresh.bundleOptions?.find(
          (b: any) => b.title === bundleData.title
      );
      const finalPrice = selectedBundleDB ? selectedBundleDB.price : (fresh.price ?? 0);

      orderItems.push({
          _type: "orderItem",
          _key: uuidv4(),
          product: { _type: "reference", _ref: it.product._id },
          quantity: it.quantity,
          price: finalPrice,
          bundleTitle: bundleData.title || "Single",
          bundleCount: bundleData.count || 1,
          bundleSavings: bundleData.savings || "",
          productName: fresh?.name || "Unknown",
          productImage: imageForSave,
          _productRev: fresh._rev, 
          _productId: fresh._id
      });
    }

    // Recalculate Subtotal
    const calculatedSubtotal = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    // 5. Build Order Object
    const orderData = {
      _type: "order",
      orderNumber: orderId,
      status: "pending",
      orderDate: new Date().toISOString(),
      customerName: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      alternativePhone: form.alternativePhone || "",
      email: form.email || "",
      address: {
        district: form.district,
        city: form.city,
        line1: form.address,
        notes: form.notes || "",
      },
      paymentMethod: form.payment || "COD",
      items: orderItems,
      subtotal: calculatedSubtotal, 
      shippingCost: shippingCost ?? 0,
      discountAmount,
      discountLabel: discountLabel || "",
      total,
    };

    // 6. Commit Transaction
    const tx = backendClient.transaction();
    tx.create(orderData);

    orderItems.forEach((it: any) => {
        tx.patch(it._productId, (p) =>
          p.inc({ stockOut: it.quantity }).ifRevisionId(it._productRev) 
        );
    });

    const result = await tx.commit();

    if (!result || !result.results?.length) {
      console.error("❌ Transaction failed:", result);
      return NextResponse.json({ error: "Order could not be processed. Please try again." }, { status: 500 });
    }

    // 7. Send Emails (Non-blocking)
    try {
      const customerHtml = generateCustomerEmail(orderData, orderItems);
      const adminHtml = generateAdminEmail(orderData, orderItems);

      // A. Send Customer Email
      const customerEmailReq = resend.emails.send({
        from: SENDER_EMAIL,
        to: form.email,
        replyTo: REPLY_TO_EMAIL,
        subject: `Order Confirmation ${orderId} - The Balanced Pantry`,
        html: customerHtml
      });

      // B. Send Admin Email
      const adminEmailReq = resend.emails.send({
        from: SENDER_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: form.email,
        subject: `🔔 New Order: ${orderId} (Rs. ${total})`,
        html: adminHtml
      });

      await Promise.all([customerEmailReq, adminEmailReq]);

    } catch (emailError) {
      console.error("⚠️ Email sending failed, but order was placed:", emailError);
    }

    return NextResponse.json(
      { message: "Order placed successfully!", orderId, payment: form.payment },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Checkout API CRITICAL Error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}


const generateCustomerEmail = (order: any, items: any[]) => {
  const isBankTransfer = order.paymentMethod?.toLowerCase().includes("bank");
  const date = new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });

  const itemsRows = items.map(item => `
    <tr style="border-bottom: 1px solid ${COLORS.border};">
      <td style="padding: 12px 0;">
        <span style="font-weight: 600; color: ${COLORS.text};">${item.productName}</span><br/>
        <span style="font-size: 12px; color: #888;">${item.bundleTitle}</span>
      </td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${COLORS.text};">
      <div style="max-width: 600px; margin: 0 auto; background: ${COLORS.card};">
        
        <div style="background-color: ${COLORS.brand}; padding: 30px; text-align: center;">
          <h1 style="color: #F3EFE0; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">The Balanced Pantry.</h1>
        </div>

        <div style="padding: 40px 30px 20px;">
          <h2 style="margin-top: 0; color: ${COLORS.brand};">Order Confirmed!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            Hi ${order.customerName.split(' ')[0]},<br/><br/>
            Thank you for choosing healthy snacking! We've received your order <strong>#${order.orderNumber}</strong> and are getting it ready.
          </p>
        </div>

        ${isBankTransfer ? `
        <div style="margin: 0 30px; background-color: #FFF8F0; border: 2px dashed ${COLORS.brand}; border-radius: 8px; padding: 20px;">
          <h3 style="margin-top: 0; color: ${COLORS.accent}; font-size: 16px; text-transform: uppercase;">⚠️ Action Required: Payment</h3>
          <p style="margin-bottom: 15px; font-size: 14px;">Please transfer <strong>Rs. ${order.total.toLocaleString()}</strong> to the account below and share the slip via WhatsApp to confirm your order.</p>
          
          <div style="background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ${BANK_DETAILS}
          </div>

          <div style="text-align: center;">
            <a href="https://wa.me/94771234567?text=Hi,%20sending%20payment%20slip%20for%20Order%20${order.orderNumber}" style="background-color: #25D366; color: white; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block;">
              Share Slip on WhatsApp &rarr;
            </a>
          </div>
        </div>
        ` : ''}

        <div style="padding: 30px;">
          <h3 style="border-bottom: 2px solid ${COLORS.brand}; padding-bottom: 10px; margin-bottom: 15px; color: ${COLORS.brand};">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="color: #888; font-size: 12px; text-transform: uppercase;">
                <th style="text-align: left; padding-bottom: 10px;">Item</th>
                <th style="text-align: center; padding-bottom: 10px;">Qty</th>
                <th style="text-align: right; padding-bottom: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 15px; text-align: right; color: #888;">Subtotal</td>
                <td style="padding-top: 15px; text-align: right;">Rs. ${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 5px; text-align: right; color: #888;">Shipping</td>
                <td style="padding-top: 5px; text-align: right;">Rs. ${order.shippingCost}</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr>
                <td colspan="2" style="padding-top: 5px; text-align: right; color: ${COLORS.accent};">Discount (${order.discountLabel})</td>
                <td style="padding-top: 5px; text-align: right; color: ${COLORS.accent};">- Rs. ${order.discountAmount}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 16px;">Total</td>
                <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 16px;">Rs. ${order.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">The Balanced Pantry, Colombo, Sri Lanka.</p>
          
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAdminEmail = (order: any, items: any[]) => {
 const isBankTransfer = order.paymentMethod?.toLowerCase().includes("bank");
  
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: monospace; background-color: #eee; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #ddd;">
        
        <div style="border-left: 5px solid ${isBankTransfer ? '#E67E22' : '#27AE60'}; padding-left: 15px; margin-bottom: 20px;">
          <h2 style="margin: 0;">${isBankTransfer ? '⚠️ Pending Payment' : '✅ COD Order'}</h2>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">Order ${order.orderNumber}</p>
          <p style="margin: 0; color: #666;">${new Date().toLocaleString()}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; margin-bottom: 20px;">
          <strong>CUSTOMER:</strong><br/>
          ${order.customerName}<br/>
          <a href="tel:${order.phone}" style="color: blue;">${order.phone}</a><br/>
          ${order.email}
        </div>

        <div style="margin-bottom: 20px;">
          <strong>SHIPPING ADDRESS (Copy for Label):</strong>
          <pre style="background: #eee; padding: 10px; border-radius: 5px; font-size: 14px;">${order.customerName}
${order.address.line1}
${order.address.city}, ${order.address.district}
Phone: ${order.phone}</pre>
        </div>

        <div style="margin-bottom: 20px;">
          <strong>PACKING LIST:</strong>
          <ul style="border-top: 1px dashed #ccc; padding-top: 10px; list-style: none; padding-left: 0;">
            ${items.map(i => `
              <li style="padding: 5px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold;">[ x${i.quantity} ]</span> ${i.productName} <span style="color: #888; font-size: 12px;">(${i.bundleTitle})</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px;">
          COLLECT: Rs. ${order.total.toLocaleString()}
          ${isBankTransfer ? '<br/><span style="font-size: 12px; color: red; font-weight: normal;">(Check Bank Slip First)</span>' : ''}
        </div>
        
      </div>
    </body>
    </html>
  `;
};