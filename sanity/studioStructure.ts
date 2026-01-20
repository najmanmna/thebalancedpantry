import { StructureBuilder, DefaultDocumentNodeResolver } from "sanity/structure";
import { OrderSummaryView } from "./views/OrderSummaryView";


// 🔹 Add custom Admin View for Orders
// 🔹 Add custom Admin View for Orders
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  if (schemaType === "order") {
    return S.document().views([
      // 👇 Put Admin View first = default
      S.view.component(OrderSummaryView).title("Admin View"),
      S.view.form().title("Edit"),
    ]);
  }
  return S.document().views([S.view.form()]);
};

// 🔹 Desk Structure
export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Orders")
        .child(
          S.list()
            .title("Orders")
            .items([
              S.listItem()
                .title("All Orders")
                .child(
                  S.documentList()
                    .title("All Orders")
                    .schemaType("order")
                    .filter('_type == "order"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),

              S.divider(),

              S.listItem()
                .title("Pending")
                .child(
                  S.documentList()
                    .title("Pending Orders")
                    .schemaType("order")
                    .filter('_type == "order" && status == "pending"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),

              S.listItem()
                .title("Processing")
                .child(
                  S.documentList()
                    .title("Processing Orders")
                    .schemaType("order")
                    .filter('_type == "order" && status == "processing"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),

              S.listItem()
                .title("Shipped")
                .child(
                  S.documentList()
                    .title("Shipped Orders")
                    .schemaType("order")
                    .filter('_type == "order" && status == "shipped"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),

              S.listItem()
                .title("Delivered")
                .child(
                  S.documentList()
                    .title("Delivered Orders")
                    .schemaType("order")
                    .filter('_type == "order" && status == "delivered"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),

              S.listItem()
                .title("Cancelled")
                .child(
                  S.documentList()
                    .title("Cancelled Orders")
                    .schemaType("order")
                    .filter('_type == "order" && status == "cancelled"')
                    .defaultOrdering([{ field: "orderDate", direction: "desc" }])
                ),
            ])
        ),

      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !["order", "orderItem"].includes(listItem.getId() ?? "")
      ),
    ]);
