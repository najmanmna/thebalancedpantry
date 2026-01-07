import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { sendSubscribeEmail } from "@/lib/sendSubscribeEmail";

export const runtime = "nodejs";

// Shared bank details
const bankDetails = `M/s Elvyn (Private) Limited
001010177892
Hatton National Bank Aluthkade`;

// --- EMAIL TEMPLATES ---
const customerOrderTemplate = (
  firstName: string,
  orderId: string,
  items: any[],
  total: number,
  shippingFee: number,
  discountAmount: number,
  paymentMethod: string,
  discountLabel: string,
  phone: string,
  alternativePhone?: string
) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <div style="text-align: center;">
      <img src="https://elvynstore.com/logo.png" alt="Elvyn" style="width: 120px; margin-bottom: 20px;">
    </div>
    <h2 style="color: #2c3e50; text-align: center;">Thank you for your order!</h2>
    <p>Hi <strong>${firstName}</strong>,</p>
    <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
    <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color:#f9f9f9;">
          <th style="padding:8px; border:1px solid #ddd; text-align:left;">Product</th>
          <th style="padding:8px; border:1px solid #ddd; text-align:center;">Qty</th>
          <th style="padding:8px; border:1px solid #ddd; text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (it) => `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;">${it.productName}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${it.quantity}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">LKR ${it.price * it.quantity}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p><strong>Subtotal:</strong> LKR ${total}</p>
    ${discountAmount > 0 ? `<p><strong>${discountLabel || 'Discount'}:</strong> -LKR ${discountAmount}</p>` : ""}
    <p><strong>Shipping Fee:</strong> LKR ${shippingFee}</p>
    <p><strong>Total:</strong> LKR ${total + shippingFee - discountAmount}</p>
    <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin:20px 0;">
      <p style="margin:5px 0;"><strong>Contact:</strong> ${phone}</p>
      ${alternativePhone ? `<p style="margin:5px 0;"><strong>Alt. Contact:</strong> ${alternativePhone}</p>` : ""}
      <p style="margin:5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
    </div>
    ${
      paymentMethod.toLowerCase().includes("bank")
        ? `
      <div style="background:#fffbea; border:1px solid #fcd34d; border-radius:8px; padding:15px; margin:20px 0;">
        <h3 style="margin:0 0 10px; color:#92400e;">Bank Transfer Instructions</h3>
        <p>Please transfer <strong>LKR ${total + shippingFee - discountAmount}</strong> using your order number <strong>${orderId}</strong> as the payment reference.</p>
        <pre style="background:#fff; border:1px solid #ddd; padding:10px; border-radius:4px; font-family:monospace; white-space:pre-wrap;">${bankDetails}</pre>
      </div>`
        : ""
    }
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://elvynstore.com" style="background-color: #ff6f61; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Visit Store</a>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center;">Team ELVYN</p>
  </div>
`;

const adminOrderTemplate = (
  orderId: string,
  form: any,
  items: any[],
  total: number,
  shippingFee: number,
  discountAmount: number,
  paymentMethod: string,
  discountLabel: string
) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #2c3e50;">New Order Placed</h2>
    <p>Order <strong>#${orderId}</strong> has been placed by <strong>${form.firstName} ${form.lastName}</strong></p>
    <p><strong>Phone:</strong> ${form.phone}</p>
    ${form.alternativePhone ? `<p style="margin:5px 0; color:#d97706;"><strong>Alt Phone:</strong> ${form.alternativePhone}</p>` : ""}
    <p><strong>Email:</strong> ${form.email || "N/A"}</p>
    <p><strong>Address:</strong> ${form.address}, ${form.city}, ${form.district}</p>
    <p><strong>Notes:</strong> ${form.notes}</p>
    <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color:#f9f9f9;">
          <th style="padding:8px; border:1px solid #ddd; text-align:left;">Product</th>
          <th style="padding:8px; border:1px solid #ddd; text-align:center;">Qty</th>
          <th style="padding:8px; border:1px solid #ddd; text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (it) => `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;">${it.productName}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${it.quantity}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:right;">LKR ${it.price * it.quantity}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p><strong>Subtotal:</strong> LKR ${total}</p>
    ${discountAmount > 0 ? `<p><strong>${discountLabel || 'Discount'}:</strong> -LKR ${discountAmount}</p>` : ""}
    <p><strong>Shipping Fee:</strong> LKR ${shippingFee}</p>
    <p><strong>Total:</strong> LKR ${total + shippingFee - discountAmount}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <br>
    <p style="color: #888; font-size: 12px;">Elvyn Store Notification System</p>
  </div>
`;

// --- MAIN HANDLER ---

export async function POST(req: Request) {
  try {
    if (!process.env.SANITY_API_TOKEN) {
      console.error("❌ Missing SANITY_API_TOKEN");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const body = await req.json();
    const { form, items, total, shippingCost, discountAmount, discountLabel } = body;

    // Validation
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

    // Duplicate Check
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

    // 4. Fetch Latest Products (Simplified Stock)
    const productIds = items.map((it: any) => it.product._id);
    const freshProducts = await backendClient.fetch(
      `*[_type=="product" && _id in $ids]{
        _id,
        _rev,
        name,
        price,
        images,
        openingStock,
        stockOut,
        "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0)
      }`,
      { ids: productIds }
    );

    // 5. Stock Validation & Item Construction
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

      // Prepare Image for Sanity Storage
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

      orderItems.push({
          _type: "orderItem",
          _key: uuidv4(),
          product: { _type: "reference", _ref: it.product._id },
          quantity: it.quantity,
          // 🔹 FIX: Use fresh.price from database, NOT payload
          price: fresh.price ?? 0, 
          productName: fresh?.name || "Unknown",
          productImage: imageForSave,
          _productRev: fresh._rev, 
          _productId: fresh._id
      });
    }

    // 🔹 FIX: Calculate Subtotal using Fresh DB Prices
    const calculatedSubtotal = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    // 6. Build Order Object
    const order = {
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
      
      // Use the safely calculated subtotal
      subtotal: calculatedSubtotal, 
      shippingCost: shippingCost ?? 0,
      discountAmount,
      discountLabel: discountLabel || "",
      total,
    };

    // 7. Transaction
    const tx = backendClient.transaction();
    tx.create(order);

    orderItems.forEach((it: any) => {
        tx.patch(it._productId, (p) =>
          p
            .inc({ stockOut: it.quantity })
            .ifRevisionId(it._productRev) 
        );
    });

    const result = await tx.commit();

    if (!result || !result.results?.length) {
      console.error("❌ Transaction failed:", result);
      return NextResponse.json({ error: "Order could not be processed. Please try again." }, { status: 500 });
    }

    // 8. Send Emails
    // try {
    //   if (form.email) {
    //     await sendSubscribeEmail({
    //       to: form.email,
    //       subject: `Your Elvyn Order ${orderId}`,
    //       html: customerOrderTemplate(
    //         form.firstName,
    //         orderId,
    //         order.items,
    //         order.subtotal,
    //         order.shippingCost,
    //         order.discountAmount ?? 0,
    //         order.paymentMethod,
    //         discountLabel,
    //         form.phone,
    //         form.alternativePhone
    //       ),
    //     });
    //   }

    //   await sendSubscribeEmail({
    //     to: "orders@elvynstore.com",
    //     subject: `New Order ${orderId} Placed`,
    //     html: adminOrderTemplate(
    //       orderId,
    //       form,
    //       order.items,
    //       order.subtotal,
    //       order.shippingCost,
    //       order.discountAmount ?? 0,
    //       order.paymentMethod,
    //       discountLabel
    //     ),
    //   });
    // } catch (err) {
    //   console.error("Email notification failed:", err);
    // }

    return NextResponse.json(
      { message: "Order placed successfully!", orderId, payment: form.payment },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Checkout API CRITICAL Error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}