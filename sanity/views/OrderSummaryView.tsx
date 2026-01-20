import React from "react";
import { urlFor } from "../lib/image"; 

export function OrderSummaryView(props: any) {
  const data = props?.document?.displayed;

  if (!data) {
    return <p style={{ padding: "1rem" }}>No order data available</p>;
  }

  return (
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif", lineHeight: 1.5, maxWidth: "800px" }}>
      
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "1rem", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Order #{data.orderNumber}</h2>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", color: "#666" }}>
            <span><strong>Status:</strong> {data.status}</span>
            <span>•</span>
            <span><strong>Date:</strong> {data.orderDate ? new Date(data.orderDate).toLocaleString() : "—"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* CUSTOMER INFO */}
          <div>
              <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Customer</h3>
              <p style={{ margin: "0.25rem 0" }}><strong>{data.customerName}</strong></p>
              <p style={{ margin: "0.25rem 0" }}>{data.phone}</p>
              {data.alternativePhone && (
                <p style={{ margin: "0.25rem 0", color: "#d97706" }}>Alt: {data.alternativePhone}</p>
              )}
              <p style={{ margin: "0.25rem 0" }}>{data.email}</p>
          </div>

          {/* SHIPPING INFO */}
          <div>
              <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Shipping Address</h3>
              <p style={{ margin: "0.25rem 0" }}>{data.address?.line1}</p>
              <p style={{ margin: "0.25rem 0" }}>
                  {data.address?.city}
                  {data.address?.district ? `, ${data.address.district}` : ""}
              </p>
              {data.address?.notes && (
                <div style={{ marginTop: "0.5rem", background: "#fffbeb", padding: "0.5rem", borderRadius: "4px", fontSize: "0.9em" }}>
                  <strong>Note:</strong> {data.address.notes}
                </div>
              )}
          </div>
      </div>

      {/* ITEMS TABLE */}
      <h3 style={{ marginTop: "2rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Items</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", fontSize: "0.95rem" }}>
        <thead style={{ background: "#f9fafb" }}>
          <tr>
            <th align="left" style={{ padding: "12px 8px" }}>Product</th>
            <th align="left" style={{ padding: "12px 8px" }}>Bundle Details</th>
            <th align="center" style={{ padding: "12px 8px" }}>Qty</th>
            <th align="right" style={{ padding: "12px 8px" }}>Unit Price</th>
            <th align="right" style={{ padding: "12px 8px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items?.map((item: any, i: number) => (
            <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              {/* Product Image & Name */}
              <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: "1rem" }}>
                {item.productImage ? (
                  <img
                    src={urlFor(item.productImage).width(100).height(100).url()}
                    alt={item.productName}
                    style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                  />
                ) : (
                  <div style={{ width: "48px", height: "48px", background: "#f3f4f6", borderRadius: "6px" }} />
                )}
                <span style={{ fontWeight: 500 }}>{item.productName || "Unknown Product"}</span>
              </td>

              {/* Bundle Info (Updated to show Pack Count) */}
              <td style={{ padding: "12px 8px", verticalAlign: "middle" }}>
                 {item.bundleTitle ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "99px", fontSize: "0.85em", fontWeight: 600 }}>
                            {item.bundleTitle}
                        </span>
                        {/* Show count if greater than 1 */}
                        {item.bundleCount > 1 && (
                             <span style={{ fontSize: "0.8em", color: "#666", paddingLeft: "4px" }}>
                                {item.bundleCount} Packs
                             </span>
                        )}
                    </div>
                 ) : (
                    <span style={{ color: "#9ca3af", fontSize: "0.9em" }}>Single (1 Pack)</span>
                 )}
              </td>

              <td align="center" style={{ padding: "12px 8px" }}>{item.quantity}</td>
              <td align="right" style={{ padding: "12px 8px" }}>Rs. {item.price?.toLocaleString()}</td>
              <td align="right" style={{ padding: "12px 8px", fontWeight: 600 }}>
                Rs. {(item.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "300px", textAlign: "right" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#666" }}>Subtotal:</span>
                <span>Rs. {data.subtotal?.toLocaleString() ?? 0}</span>
            </div>
            
            {data.discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#16a34a" }}>
                    <span>{data.discountLabel || 'Discount'}:</span>
                    <span>– Rs. {data.discountAmount?.toLocaleString()}</span>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#666" }}>Shipping:</span>
                <span>Rs. {data.shippingCost?.toLocaleString() ?? 0}</span>
            </div>

            <div style={{ borderTop: "2px solid #ddd", paddingTop: "0.5rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "bold" }}>
                <span>Total:</span>
                <span>Rs. {data.total?.toLocaleString()}</span>
            </div>
             
             <div style={{ marginTop: "1rem", fontSize: "0.9em", color: "#666" }}>
                Payment: {data.paymentMethod || "COD"}
             </div>
        </div>
      </div>

    </div>
  );
}