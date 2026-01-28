import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";

export const runtime = 'edge';

// --- CONFIGURATION ---
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "najeeramni@gmail.com"; // Updated to your preferred admin
const SENDER_EMAIL = "The Balanced Pantry <no-reply@thebalancedpantry.lk>";
const REPLY_TO_EMAIL = "orders@thebalancedpantry.lk"; 

// --- BRANDING CONSTANTS ---
const BRAND = {
  cream: "#F3EFE0",
  charcoal: "#4A3728",
  red: "#D64545",
  green: "#5D7052",
  gold: "#F59E0B",
  white: "#FFFFFF",
  gray: "#f4f4f4"
};

const BANK_DETAILS_HTML = `
  <div style="background-color: #FFF8E1; border: 1px dashed ${BRAND.charcoal}; padding: 15px; margin: 20px 0; border-radius: 8px;">
    <h3 style="margin: 0 0 10px 0; color: ${BRAND.charcoal}; font-family: 'Georgia', serif;">🏦 Bank Transfer Details</h3>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #555;">
      <strong>Bank:</strong> Nations Trust Bank<br/>
      <strong>Branch:</strong> Wellawatte<br/>
      <strong>Account Name:</strong> F A Uwais<br/>
      <strong>Account No:</strong> 005212035096
    </p>
    <p style="margin-top: 10px; font-size: 12px; color: #888;">
      Please send your slip via WhatsApp to <a href="https://wa.me/94777242120" style="color: ${BRAND.red}; text-decoration: none;">077 724 2120</a>
    </p>
  </div>
`;

// --- HELPER: Payable Hash Generation ---
async function generatePayableHash(orderId: string, amount: string) {
  const merchantKey = process.env.NEXT_PUBLIC_PAYABLE_MERCHANT_KEY;
  const merchantToken = process.env.PAYABLE_MERCHANT_TOKEN;

  if (!merchantKey || !merchantToken) throw new Error("Missing Payable Credentials");

  const tokenBuffer = new TextEncoder().encode(merchantToken);
  const tokenHashBuffer = await crypto.subtle.digest("SHA-512", tokenBuffer);
  const tokenHashArray = Array.from(new Uint8Array(tokenHashBuffer));
  const encryptedToken = tokenHashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

  const hashString = `${merchantKey}|${orderId}|${amount}|LKR|${encryptedToken}`;
  const msgBuffer = new TextEncoder().encode(hashString);
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// --- HELPER: Money Formatter ---
const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

// --- MAIN HANDLER ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { form, items, total, shippingCost, discountAmount, discountLabel } = body;

    // 1. Validation
    if (!form?.firstName || !form?.lastName || !form?.phone || !items?.length) {
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

    // 3. Create Order Object
    const isCard = form.payment === "CARD";
    const orderData = {
      _type: "order",
      orderNumber: orderId,
      status: "pending",
      paymentStatus: "pending", 
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

      // 2. Generate Hash & Return
      const hash = await generatePayableHash(orderId, total.toFixed(2));
      return NextResponse.json({ message: "Order created, proceed to payment", orderId, hash }, { status: 200 });
    }

    // ----------------------------------------------------
    // 📦 COD / BANK TRANSFER LOGIC
    // ----------------------------------------------------
    else {
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

// ==========================================
// 🎨 UPGRADED EMAIL TEMPLATES
// ==========================================

// --- 1. ADMIN PENDING (WARNING) ---
const generateAdminPendingEmail = (orderId: string, customerName: string, total: number) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Helvetica, Arial, sans-serif; background-color: ${BRAND.gray}; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: ${BRAND.white}; border-radius: 8px; border: 1px solid #ddd; overflow: hidden;">
        
        <div style="background-color: ${BRAND.gold}; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: white; text-transform: uppercase; letter-spacing: 1px; font-size: 18px;">⏳ Payment Pending</h2>
        </div>

        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px;">A new Card order has been created, but payment is not confirmed yet.</p>
          
          <div style="background: #FFF8E1; border-left: 5px solid ${BRAND.gold}; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E; font-weight: bold;">⚠️ Do not ship yet.</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #B45309;">Wait for the "Payment Verified" email.</p>
          </div>

          <table style="width: 100%; margin-top: 20px;">
            <tr><td style="color: #666;">Order ID:</td><td style="font-weight: bold; text-align: right;">${orderId}</td></tr>
            <tr><td style="color: #666;">Customer:</td><td style="font-weight: bold; text-align: right;">${customerName}</td></tr>
            <tr><td style="color: #666;">Total:</td><td style="font-weight: bold; text-align: right;">${formatMoney(total)}</td></tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- 2. CUSTOMER RECEIPT (THE BALANCED PANTRY THEME) ---
const generateCustomerEmail = (order: any, items: any[]) => {
  const isBankTransfer = order.paymentMethod?.toLowerCase().includes("bank");
  const isCOD = order.paymentMethod?.toLowerCase().includes("cash");

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: ${BRAND.charcoal};">
        <strong style="font-size: 14px;">${item.productName}</strong><br/>
        <span style="font-size: 12px; color: #888;">${item.bundleTitle}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; color: ${BRAND.charcoal};">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: ${BRAND.charcoal};">${formatMoney(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BRAND.cream}; margin: 0; padding: 20px;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="background-color: ${BRAND.charcoal}; padding: 30px; text-align: center;">
          <h1 style="color: ${BRAND.cream}; margin: 0; font-family: 'Georgia', serif; font-size: 24px;">The Balanced Pantry</h1>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: ${BRAND.charcoal}; margin-top: 0; font-size: 22px;">Order Confirmed!</h2>
          <p style="color: #666; font-size: 15px; line-height: 1.5;">
            Hi ${order.customerName.split(' ')[0]}, thank you for stocking your pantry with us. Your order <strong>#${order.orderNumber}</strong> has been received.
          </p>

          ${isBankTransfer ? BANK_DETAILS_HTML : ''}
          ${isCOD ? `<p style="color: ${BRAND.green}; font-weight: bold; font-size: 14px;">🚚 Please have cash ready upon delivery.</p>` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="color: #999; font-size: 12px; text-transform: uppercase;">
                <th align="left" style="padding-bottom: 10px;">Item</th>
                <th align="center" style="padding-bottom: 10px;">Qty</th>
                <th align="right" style="padding-bottom: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 15px; text-align: right; color: #666;">Subtotal:</td>
                <td style="padding-top: 15px; text-align: right; color: ${BRAND.charcoal};">${formatMoney(order.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; color: #666;">Shipping:</td>
                <td style="text-align: right; color: ${BRAND.charcoal};">${formatMoney(order.shippingCost)}</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr>
                <td colspan="2" style="text-align: right; color: ${BRAND.red};">Discount (${order.discountLabel}):</td>
                <td style="text-align: right; color: ${BRAND.red};">-${formatMoney(order.discountAmount)}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding-top: 10px; text-align: right; font-weight: bold; font-size: 18px; color: ${BRAND.charcoal};">Total:</td>
                <td style="padding-top: 10px; text-align: right; font-weight: bold; font-size: 18px; color: ${BRAND.charcoal};">${formatMoney(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #999; text-transform: uppercase;">Shipping Address</h3>
            <p style="margin: 0; color: ${BRAND.charcoal}; font-size: 14px; line-height: 1.5;">
              ${order.customerName}<br/>
              ${order.address.line1}<br/>
              ${order.address.city}, ${order.address.district}<br/>
              ${order.phone}
            </p>
          </div>

        </div>

        <div style="background-color: ${BRAND.gray}; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">&copy; 2026 The Balanced Pantry. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- 3. ADMIN NOTIFICATION (GREEN/ACTIONABLE) ---
const generateAdminEmail = (order: any, items: any[]) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: monospace; background: #eee; padding: 20px;">
      <div style="background: #fff; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ccc; border-top: 5px solid ${BRAND.green};">
        
        <h2 style="color: ${BRAND.charcoal}; margin-top: 0; font-family: Helvetica, sans-serif;">✅ New Order: ${order.orderNumber}</h2>
        
        <div style="background: #f0fdf4; padding: 10px; border: 1px solid #bbf7d0; color: #166534; font-weight: bold; border-radius: 4px; text-align: center; margin-bottom: 20px;">
          Ready to Pack
        </div>

        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Phone:</strong> <a href="tel:${order.phone}" style="color: blue;">${order.phone}</a></p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;"/>
        
        <ul style="padding-left: 20px; margin: 0; font-size: 14px;">
          ${items.map(i => `
            <li style="margin-bottom: 5px;">
              ${i.productName} - <span style="font-weight: bold;">${i.bundleTitle}</span> x${i.quantity}
            </li>
          `).join('')}
        </ul>
        
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;"/>
        
        <p style="font-size: 16px;"><strong>Total To Collect:</strong> ${formatMoney(order.total)}</p>
        
        <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 13px; border: 1px solid #eee;">
          <strong>Address:</strong><br/>
          ${order.address.line1}, ${order.address.city}, ${order.address.district}
          ${order.address.notes ? `<br/><br/><em>Note: ${order.address.notes}</em>` : ''}
        </div>

        <div style="margin-top: 20px; text-align: center;">
           <a href="https://thebalancedpantry.lk/studio/desk/orders" style="background: ${BRAND.charcoal}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block;">Open Sanity Studio</a>
        </div>

      </div>
    </body>
    </html>
  `;
};