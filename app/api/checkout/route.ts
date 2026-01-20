import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
// import { sendSubscribeEmail } from "@/lib/sendSubscribeEmail"; // Keep commented if not using yet

export const runtime = 'edge';

// Shared bank details
const bankDetails = `M/s Elvyn (Private) Limited
001010177892
Hatton National Bank Aluthkade`;

export async function POST(req: Request) {
  try {
    if (!process.env.SANITY_API_TOKEN) {
      console.error("❌ Missing SANITY_API_TOKEN");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const body = await req.json();
    const { form, items, total, shippingCost, discountAmount, discountLabel } = body;

    // --- 1. Validation ---
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

    // --- 2. Duplicate Check ---
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

    // --- 3. Fetch Products (With Bundle Options) ---
    const productIds = items.map((it: any) => it.product._id);
    
    // 🔹 FIX 1: Added 'bundleOptions' to query to validate bundle prices
    const freshProducts = await backendClient.fetch(
      `*[_type=="product" && _id in $ids]{
        _id,
        _rev,
        name,
        price,
        images,
        bundleOptions, 
        openingStock,
        stockOut,
        "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0)
      }`,
      { ids: productIds }
    );

    // --- 4. Process Items & Validate Stock ---
    const orderItems = [];

    for (const it of items) {
      const fresh = freshProducts.find((p: any) => p._id === it.product._id);
      
      if (!fresh) {
        return NextResponse.json({ error: `Product not found: ${it.product?._id}` }, { status: 404 });
      }

      // Check Stock
      // Note: We currently track stock by "Packs". If a bundle has 3 packs, 
      // the frontend should pass quantity=1 (bundle) but we deduct 3? 
      // Usually, simplest is: 1 Bundle = 1 Unit of Stock deduction unless you track granularly.
      // Assuming 1 sale = 1 stock deduction for now.
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

      // 🔹 FIX 2: Determine Correct Price (Base vs Bundle)
      // We look for a matching bundle title in the DB options.
      const bundleData = it.bundle || {}; 
      const selectedBundleDB = fresh.bundleOptions?.find(
          (b: any) => b.title === bundleData.title
      );

      // If we found a matching bundle in DB, use THAT price. Otherwise use base price.
      const finalPrice = selectedBundleDB ? selectedBundleDB.price : (fresh.price ?? 0);

      // 🔹 FIX 3: Push Bundle Metadata to Sanity
      orderItems.push({
          _type: "orderItem",
          _key: uuidv4(),
          product: { _type: "reference", _ref: it.product._id },
          quantity: it.quantity,
          
          price: finalPrice, // Validated price from DB
          
          // Capture the bundle details!
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

    // --- 5. Build Order Object ---
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
      
      subtotal: calculatedSubtotal, 
      shippingCost: shippingCost ?? 0,
      discountAmount,
      discountLabel: discountLabel || "",
      total,
    };

    // --- 6. Commit Transaction ---
    const tx = backendClient.transaction();
    tx.create(order);

    orderItems.forEach((it: any) => {
        // Deduct stock based on quantity sold
        tx.patch(it._productId, (p) =>
          p
            .inc({ stockOut: it.quantity }) // If you need to deduct 'bundleCount * quantity', change this here.
            .ifRevisionId(it._productRev) 
        );
    });

    const result = await tx.commit();

    if (!result || !result.results?.length) {
      console.error("❌ Transaction failed:", result);
      return NextResponse.json({ error: "Order could not be processed. Please try again." }, { status: 500 });
    }

    // --- 7. Emails (Commented out as requested) ---
    // ... email logic ...

    return NextResponse.json(
      { message: "Order placed successfully!", orderId, payment: form.payment },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Checkout API CRITICAL Error:", err);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}