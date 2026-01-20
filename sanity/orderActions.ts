import { DocumentActionComponent, DocumentActionProps } from "sanity";
import { useClient } from "sanity";
import { useState } from "react";

// --- Updated Interfaces ---

interface OrderItem {
  product?: { _ref: string };
  quantity?: number;      // e.g., 2 (bundles)
  bundleCount?: number;   // e.g., 3 (items per bundle)
}

interface OrderDocument {
  _id: string;
  _type: string;
  status?: string;
  items?: OrderItem[];
}

// ---------------------------------

export function useOrderActions(
  originalActions: DocumentActionComponent[]
): DocumentActionComponent[] {
  return originalActions.map((Action) => {
    if (Action && Action.action === "publish") {
      const CustomPublishAction: DocumentActionComponent = (
        props: DocumentActionProps
      ) => {
        const client = useClient({ apiVersion: "2025-01-01" });
        const defaultAction = Action(props);
        
        // Add local state to prevent double-clicks
        const [isProcessing, setIsProcessing] = useState(false);

        if (!defaultAction) return null;

        return {
          ...defaultAction,
          
          // Disable button if default is disabled OR we are processing
          disabled: defaultAction.disabled || isProcessing,
          label: isProcessing ? "Processing Order..." : defaultAction.label,

          onHandle: async () => {
            setIsProcessing(true);

            try {
              const { draft, published } = props;
              
              const draftOrder = draft as OrderDocument | null;
              const publishedOrder = published as OrderDocument | null;

              // Ensure we are working with an order
              if (draftOrder?._type === "order" || publishedOrder?._type === "order") {
                
                const oldStatus = publishedOrder?.status;
                const newStatus = draftOrder?.status;

                // 🛑 Case 1: Restore stock on Cancellation
                // Only runs if status CHANGE is confirmed: anything -> cancelled
                if (oldStatus !== "cancelled" && newStatus === "cancelled") {
                  const tx = client.transaction();
                  const itemsToProcess = draftOrder?.items || publishedOrder?.items || [];

                  // Iterate through items
                  for (const item of itemsToProcess) {
                    const productRef = item.product?._ref;
                    const bundleQty = item.quantity || 0;
                    const itemsPerBundle = item.bundleCount || 1; // Default to 1 if missing
                    
                    // 🔹 CRITICAL FIX: Calculate Total Units (Bundles * Count)
                    const totalUnitsToRestore = bundleQty * itemsPerBundle;

                    if (!productRef || totalUnitsToRestore <= 0) {
                      continue;
                    }

                    // 1. Fetch current 'stockOut' to ensure we don't go below zero
                    // (prevents data corruption if stockOut was already 0)
                    const currentStockOut = await client.fetch<number>(
                      `*[_type=="product" && _id==$id][0].stockOut`,
                      { id: productRef }
                    );

                    // 2. Safe adjustment 
                    // We can only restore what was marked as "out". 
                    const safeAdjustment = Math.min(totalUnitsToRestore, currentStockOut || 0);

                    if (safeAdjustment > 0) {
                      // 3. Decrement stockOut (Put items back "in")
                      tx.patch(productRef, (p) => 
                        p.inc({ stockOut: -safeAdjustment }) 
                      );
                      console.log(`↩️ Restoring ${safeAdjustment} units to product ${productRef}`);
                    }
                  }

                  await tx.commit();
                  console.log("✅ Stock restored safely for cancelled order.");
                }

                // 🛑 Case 2: Prevent Reopening
                // If it WAS cancelled, and the new status is NOT cancelled (e.g. pending/delivered)
                if (oldStatus === "cancelled" && newStatus !== "cancelled") {
                  alert(
                    "⛔️ ACTION BLOCKED\n\nThis order was previously cancelled and stock was restored.\nYou cannot reopen it as it would mess up inventory tracking.\n\nPlease create a new order."
                  );
                  setIsProcessing(false); // Reset UI
                  return; // ❌ STOP PUBLISH
                }
              }

              // ✅ If checks pass, perform the actual Sanity publish
              defaultAction.onHandle?.();

              // Note: We don't set isProcessing(false) here because usually 
              // the studio reloads/redirects after a successful publish.

            } catch (err) {
              console.error("Custom order action failed:", err);
              if (err instanceof Error) {
                alert(`Error: ${err.message}. Check console.`);
              } else {
                alert(`An unknown error occurred. Check console.`);
              }
              
              // Reset state on error so user can try again
              setIsProcessing(false);
            }
          },
        };
      };

      return CustomPublishAction;
    }

    return Action;
  });
}