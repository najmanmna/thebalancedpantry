import { DocumentActionComponent, DocumentActionProps } from "sanity";
import { useClient } from "sanity";
import { useState } from "react";

// --- Interfaces ---

interface OrderItem {
  product?: { _ref: string };
  quantity?: number;      // e.g., 2 (bundles)
  bundleCount?: number;   // e.g., 3 (items per bundle) - Now saved from Checkout!
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
        const [isProcessing, setIsProcessing] = useState(false);

        if (!defaultAction) return null;

        return {
          ...defaultAction,
          disabled: defaultAction.disabled || isProcessing,
          label: isProcessing ? "Processing..." : defaultAction.label,

          onHandle: async () => {
            setIsProcessing(true);

            try {
              const { draft, published } = props;
              const draftOrder = draft as OrderDocument | null;
              const publishedOrder = published as OrderDocument | null;

              if (draftOrder?._type === "order" || publishedOrder?._type === "order") {
                const oldStatus = publishedOrder?.status;
                const newStatus = draftOrder?.status;

                // 🛑 RESTORE STOCK LOGIC
                if (oldStatus !== "cancelled" && newStatus === "cancelled") {
                  const tx = client.transaction();
                  const itemsToProcess = draftOrder?.items || publishedOrder?.items || [];

                  for (const item of itemsToProcess) {
                    const productRef = item.product?._ref;
                    const bundleQty = item.quantity || 0;
                    
                    // ✅ READ THE SAVED BUNDLE COUNT
                    const itemsPerBundle = item.bundleCount || 1; 
                    
                    // ✅ RESTORE TOTAL UNITS
                    const totalUnitsToRestore = bundleQty * itemsPerBundle;

                    if (!productRef || totalUnitsToRestore <= 0) continue;

                    // Safety check: Don't restore more than what is currently "Out"
                    const currentStockOut = await client.fetch<number>(
                      `*[_type=="product" && _id==$id][0].stockOut`,
                      { id: productRef }
                    );

                    const safeAdjustment = Math.min(totalUnitsToRestore, currentStockOut || 0);

                    if (safeAdjustment > 0) {
                      tx.patch(productRef, (p) => 
                        p.inc({ stockOut: -safeAdjustment }) 
                      );
                      console.log(`↩️ Restored ${safeAdjustment} units (Bundle: ${itemsPerBundle}x${bundleQty})`);
                    }
                  }

                  await tx.commit();
                }

                // 🛑 PREVENT REOPENING
                if (oldStatus === "cancelled" && newStatus !== "cancelled") {
                  alert("⛔️ CANNOT RE-OPEN\n\nStock has already been restored for this order.\nPlease create a new order instead.");
                  setIsProcessing(false);
                  return;
                }
              }

              // Proceed with Publish
              defaultAction.onHandle?.();

            } catch (err) {
              console.error("Action failed:", err);
              alert("Error processing order. Check console.");
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