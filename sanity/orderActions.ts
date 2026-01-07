// src/sanity/actions/useOrderActions.ts
import { DocumentActionComponent, DocumentActionProps } from "sanity";
import { useClient } from "sanity";
import { useState } from "react";

// --- Updated Interfaces (Simplified Schema) ---

interface OrderItem {
  product?: { _ref: string };
  quantity?: number;
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
        
        // Add local state
        const [isProcessing, setIsProcessing] = useState(false);

        if (!defaultAction) return null;

        return {
          ...defaultAction,
          
          // Disable button if default is disabled OR we are processing
          disabled: defaultAction.disabled || isProcessing,
          label: isProcessing ? "Processing Order..." : defaultAction.label,

          onHandle: async () => {
            // Set state to true IMMEDIATELY
            setIsProcessing(true);

            try {
              const { draft, published } = props;
              const order: OrderDocument = (draft || published) as OrderDocument;

              if (order._type === "order") {
                const oldStatus = published?.status;
                const newStatus = draft?.status;

                // 🛑 Case 1: Restore stock on Cancellation
                if (oldStatus !== "cancelled" && newStatus === "cancelled") {
                  const tx = client.transaction();

                  for (const item of order.items || []) {
                    const productRef = item.product?._ref;
                    const quantity = item.quantity;

                    if (!productRef || typeof quantity !== "number") {
                      continue;
                    }

                    // 1. Fetch current 'stockOut' to ensure we don't go below zero
                    const currentStockOut = await client.fetch<number>(
                      `*[_type=="product" && _id==$id][0].stockOut`,
                      { id: productRef }
                    );

                    // 2. Safe adjustment (don't restore more than what was marked as out)
                    const adjustment = Math.min(quantity, currentStockOut || 0);

                    if (adjustment > 0) {
                      // 3. Decrement stockOut (Simple Schema)
                      tx.patch(productRef, (p) => 
                        p.inc({ stockOut: -adjustment }) 
                      );
                    }
                  }

                  await tx.commit();
                  console.log("✅ Stock restored safely for cancelled order:", order._id);
                }

                // 🛑 Case 2: Prevent Reopening
                // Once an order is cancelled, stock is put back. 
                // We block reopening to prevent stock sync issues.
                if (oldStatus === "cancelled" && newStatus !== "cancelled") {
                  window.alert(
                    "This order has been cancelled and cannot be reopened directly.\nPlease create a new order instead."
                  );
                  setIsProcessing(false); // Reset state
                  return; // Stop publish
                }
              }

              // Continue with default publish
              defaultAction.onHandle?.();

            } catch (err) {
              console.error("Custom order action failed:", err);
              if (err instanceof Error) {
                window.alert(`Error: ${err.message}. Check console.`);
              } else {
                window.alert(`An unknown error occurred. Check console.`);
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