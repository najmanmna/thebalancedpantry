import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";

export const runtime = 'edge';

// --- CONFIGURATION ---
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "mnanajman@gmail.com"; // Admin notification email
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>";
const REPLY_TO_EMAIL = "orders@thebalancedpantry.lk"; 

const COLORS = {
  bg: "#F9F9F9",
  card: "#FFFFFF",
  text: "#333333",
  brand: "#4A3728",
  accent: "#D9534F",
  border: "#EAEAEA"
};

const BANK_DETAILS = `
  <strong>Bank:</strong> Nations Trust Bank<br/>
  <strong>Branch:</strong> Wellawatte<br/>
  <strong>Account Name:</strong> F A Uwais<br/>
  <strong>Account No:</strong> 005212035096
`;

// --- HELPER: Payable Hash Generation (SHA-512) ---
async function generatePayableHash(orderId: string, amount: string) {
  const merchantKey = process.env.NEXT_PUBLIC_PAYABLE_MERCHANT_KEY;
  const merchantToken = process.env.PAYABLE_MERCHANT_TOKEN;

  if (!merchantKey || !merchantToken) {
    throw new Error("Missing Payable Credentials");
  }

  // 1. Encrypt Token
  const tokenBuffer = new TextEncoder().encode(merchantToken);
  const tokenHashBuffer = await crypto.subtle.digest("SHA-512", tokenBuffer);
  const tokenHashArray = Array.from(new Uint8Array(tokenHashBuffer));
  const encryptedToken = tokenHashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

  // 2. Generate Final Hash: key|orderId|amount|LKR|encryptedToken
  const hashString = `${merchantKey}|${orderId}|${amount}|LKR|${encryptedToken}`;
  const msgBuffer = new TextEncoder().encode(hashString);
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// --- MAIN HANDLER ---
export async function POST(req: Request) {
  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const body = await req.json();
    const { form, items, total, shippingCost, discountAmount, discountLabel } = body;

    // 1. Input Validation
    const phoneRegex = /^(07[0-9]{8}|947[0-9]{8})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!form?.firstName || !form?.lastName || !form?.phone || !items?.length || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
    }

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    // 2. Fetch Products & Validate Stock
    const productIds = items.map((it: any) => it.product._id);
    const freshProducts = await backendClient.fetch(
      `*[_type=="product" && _id in $ids]{ _id, _rev, name, price, images, bundleOptions, openingStock, stockOut, "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0) }`,
      { ids: productIds }
    );

    const orderItems = [];
    for (const it of items) {
      const fresh = freshProducts.find((p: any) => p._id === it.product._id);
      if (!fresh) return NextResponse.json({ error: `Product not found: ${it.product?._id}` }, { status: 404 });
      if (fresh.availableStock < it.quantity) return NextResponse.json({ error: `Insufficient stock for ${fresh.name}` }, { status: 409 });

      const bundleData = it.bundle || {}; 
      const selectedBundleDB = fresh.bundleOptions?.find((b: any) => b.title === bundleData.title);
      const finalPrice = selectedBundleDB ? selectedBundleDB.price : (fresh.price ?? 0);

      // Prepare Image Ref
      const rawImage = it.productImage || fresh?.images?.[0];
      let imageForSave = undefined;
      if (rawImage?.asset?._ref) {
         imageForSave = { _type: "image", asset: { _type: "reference", _ref: rawImage.asset._ref } };
      }

      orderItems.push({
         _type: "orderItem",
         _key: uuidv4(),
         product: { _type: "reference", _ref: it.product._id },
         quantity: it.quantity,
         price: finalPrice,
         bundleTitle: bundleData.title || "Single",
         productName: fresh.name,
         productImage: imageForSave,
         _productRev: fresh._rev, 
         _productId: fresh._id
      });
    }

    const calculatedSubtotal = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    // 3. Build Order Object
    const isCard = form.payment === "CARD";
    const orderData = {
      _type: "order",
      orderNumber: orderId,
      status: "pending",
      paymentStatus: "pending", // ✅ Added payment status
      orderDate: new Date().toISOString(),
      customerName: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      alternativePhone: form.alternativePhone || "",
      email: form.email || "",
      address: { district: form.district, city: form.city, line1: form.address, notes: form.notes || "" },
      paymentMethod: form.payment || "COD",
      items: orderItems,
      subtotal: calculatedSubtotal, 
      shippingCost: shippingCost ?? 0,
      discountAmount,
      discountLabel: discountLabel || "",
      total,
      emailSent: false,
    };

    // 4. Commit Transaction
    const tx = backendClient.transaction();
    tx.create(orderData);
    orderItems.forEach((it: any) => {
        tx.patch(it._productId, (p) => p.inc({ stockOut: it.quantity }).ifRevisionId(it._productRev));
    });

    const result = await tx.commit();
    if (!result) return NextResponse.json({ error: "Order failed." }, { status: 500 });

    // ----------------------------------------------------
    // 💳 CARD PAYMENT LOGIC
    // ----------------------------------------------------
    if (isCard) {
      // 1. Send "Payment Pending" Email to Admin ONLY
      try {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: ADMIN_EMAIL,
          subject: `[ACTION REQUIRED] Payment Pending: Order ${orderId}`,
          html: generateAdminPendingEmail(orderId, orderData.customerName, total)
        });
      } catch (e) { console.error("Admin pending email failed", e); }

      // 2. Generate Hash & Return to Frontend
      const hash = await generatePayableHash(orderId, total.toFixed(2));
      return NextResponse.json({ 
        message: "Order created, proceed to payment", 
        orderId, 
        hash 
      }, { status: 200 });
    }

    // ----------------------------------------------------
    // 📦 COD / BANK TRANSFER LOGIC
    // ----------------------------------------------------
    else {  // ✅ Added ELSE block to prevent double emails
        try {
          const customerHtml = generateCustomerEmail(orderData, orderItems);
          const adminHtml = generateAdminEmail(orderData, orderItems);

          await Promise.all([
            resend.emails.send({
              from: SENDER_EMAIL,
              to: form.email,
              replyTo: REPLY_TO_EMAIL,
              subject: `Order Confirmation ${orderId}`,
              html: customerHtml
            }),
            resend.emails.send({
              from: SENDER_EMAIL,
              to: ADMIN_EMAIL,
              replyTo: form.email,
              subject: `🔔 New Order: ${orderId} (Rs. ${total})`,
              html: adminHtml
            })
          ]);
        } catch (e) { console.error("Email failed", e); }

        return NextResponse.json({ message: "Order placed successfully!", orderId, payment: form.payment }, { status: 200 });
    }

  } catch (err: any) {
    console.error("❌ Checkout Error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}

// --- EMAIL TEMPLATES ---

const generateAdminPendingEmail = (orderId: string, customerName: string, total: number) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #ddd;">
        <div style="background-color: #F59E0B; padding: 15px; text-align: center; color: white;">
          <h2>⏳ Payment Pending (Card)</h2>
        </div>
        <p>A new order <strong>${orderId}</strong> has been created via Card payment.</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> Rs. ${total.toLocaleString()}</p>
        <div style="background: #FFF8E1; padding: 10px; margin-top: 10px; border-left: 4px solid #F59E0B;">
          ⚠️ <strong>Do not ship yet.</strong> Verify Payment.
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateCustomerEmail = (order: any, items: any[]) => {
  const isBankTransfer = order.paymentMethod?.toLowerCase().includes("bank");
  const itemsRows = items.map(item => `
    <tr style="border-bottom: 1px solid ${COLORS.border};">
      <td style="padding: 12px 0;">${item.productName}<br/><span style="font-size: 12px; color: #888;">${item.bundleTitle}</span></td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join("");

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; color: ${COLORS.text};">
      <div style="max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: ${COLORS.brand};">Order Confirmed!</h2>
        <p>Hi ${order.customerName.split(' ')[0]}, we received your order <strong>#${order.orderNumber}</strong>.</p>
        
        ${isBankTransfer ? `
        <div style="background: #FFF8F0; border: 1px dashed ${COLORS.brand}; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: ${COLORS.accent};">⚠️ Payment Required</h3>
          <p>Please transfer <strong>Rs. ${order.total.toLocaleString()}</strong> to:</p>
          ${BANK_DETAILS}
          <p><a href="https://wa.me/+94777242120?text=Payment%20Slip%20for%20${order.orderNumber}">Share Slip via WhatsApp</a></p>
        </div>` : ''}

        <table style="width: 100%; border-collapse: collapse;">
          <thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Price</th></tr></thead>
          <tbody>${itemsRows}</tbody>
          <tfoot>
            <tr><td colspan="2" align="right">Subtotal</td><td align="right">Rs. ${order.subtotal.toLocaleString()}</td></tr>
            <tr><td colspan="2" align="right">Shipping</td><td align="right">Rs. ${order.shippingCost}</td></tr>
            <tr><td colspan="2" align="right"><strong>Total</strong></td><td align="right"><strong>Rs. ${order.total.toLocaleString()}</strong></td></tr>
          </tfoot>
        </table>
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
    <body style="font-family: monospace; background: #eee; padding: 20px;">
      <div style="background: #fff; padding: 20px; max-width: 500px; margin: auto;">
        <h2 style="color: ${isBankTransfer ? '#E67E22' : '#27AE60'};">${isBankTransfer ? '⚠️ Pending Payment' : '✅ New Order'}</h2>
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.customerName} (${order.phone})</p>
        <hr/>
        <ul>${items.map(i => `<li>${i.productName} x${i.quantity}</li>`).join('')}</ul>
        <hr/>
        <p><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
        <p><strong>Address:</strong> ${order.address.line1}, ${order.address.city}</p>
      </div>
    </body>
    </html>
  `;
};