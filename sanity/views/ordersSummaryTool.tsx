// // src/sanity/tools/ordersSummaryTool.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import { definePlugin } from "sanity";
// import { useClient } from "sanity";
// import { 
//   Card, 
//   Container, 
//   Flex, 
//   Heading, 
//   Stack, 
//   Text, 
//   TextInput, 
//   Select, 
//   Button, 
//   Badge, 
//   Box, 
//   Spinner 
// } from "@sanity/ui";
// import { SearchIcon, RefreshIcon, BasketIcon } from "@sanity/icons";

// export const ordersSummaryTool = definePlugin({
//   name: "orders-summary",
//   tools: [
//     {
//       name: "orders-summary",
//       title: "Orders Summary",
//       component: OrdersSummary,
//       icon: BasketIcon,
//     },
//   ],
// });

// interface OrderItem {
//   productName: string;
//   quantity?: number;
//   price?: number;
// }

// interface Order {
//   _id: string;
//   orderNumber: string;
//   customerName: string;
//   status?: string;
//   total?: number;
//   orderDate?: string;
//   items?: OrderItem[];
// }

// function OrdersSummary() {
//   const client = useClient({ apiVersion: "2025-01-01" });
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchOrders = useCallback(() => {
//     setLoading(true);
//     client
//       .fetch(
//         `*[_type == "order"]{
//           _id,
//           orderNumber,
//           customerName,
//           status,
//           total,
//           orderDate,
//           items[]{
//             productName,
//             quantity,
//             price
//           }
//         } | order(orderDate desc)`
//       )
//       .then(setOrders)
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [client]);

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   const filteredOrders = orders
//     .filter((o) =>
//       o.customerName.toLowerCase().includes(search.toLowerCase()) ||
//       o.orderNumber.toLowerCase().includes(search.toLowerCase())
//     )
//     .filter((o) => !filterStatus || o.status === filterStatus);

//   // Map status strings to Sanity Badge tones
//   const getStatusTone = (status?: string) => {
//     switch (status) {
//       case "pending": return "caution";   // Yellow
//       case "processing": return "primary"; // Blue
//       case "shipped": return "primary";    // Blue
//       case "delivered": return "positive"; // Green
//       case "cancelled": return "critical"; // Red
//       default: return "default";           // Gray
//     }
//   };

//   return (
//     <Card height="fill" tone="transparent" padding={4} overflow="auto">
//       <Container width={4}>
//         <Stack space={5}>
          
//           {/* --- HEADER --- */}
//           <Flex justify="space-between" align="center">
//             <Box>
//               <Heading as="h1" size={3}>Orders Summary</Heading>
//               <Text size={1} muted style={{ marginTop: 8 }}>
//                 View and track store orders
//               </Text>
//             </Box>
//             <Button 
//               icon={RefreshIcon} 
//               text="Refresh" 
//               onClick={fetchOrders} 
//               mode="ghost" 
//               disabled={loading}
//             />
//           </Flex>

//           {/* --- FILTERS --- */}
//           <Card padding={3} radius={2} shadow={1}>
//             <Flex gap={3} align="center" wrap="wrap">
//               <Box flex={2} style={{ minWidth: "200px" }}>
//                 <TextInput
//                   fontSize={2}
//                   icon={SearchIcon}
//                   placeholder="Search order # or customer..."
//                   value={search}
//                   onChange={(e) => setSearch(e.currentTarget.value)}
//                 />
//               </Box>
//               <Box flex={1} style={{ minWidth: "150px" }}>
//                 <Select
//                   fontSize={2}
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.currentTarget.value)}
//                 >
//                   <option value="">All Statuses</option>
//                   <option value="pending">Pending</option>
//                   <option value="processing">Processing</option>
//                   <option value="shipped">Shipped</option>
//                   <option value="delivered">Delivered</option>
//                   <option value="cancelled">Cancelled</option>
//                 </Select>
//               </Box>
//             </Flex>
//           </Card>

//           {/* --- DATA TABLE --- */}
//           {loading ? (
//             <Flex align="center" justify="center" padding={5}>
//               <Spinner size={3} />
//             </Flex>
//           ) : (
//             <Card radius={2} shadow={1} style={{ overflow: "hidden" }}>
//               <div style={{ overflowX: "auto" }}>
//                 <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
//                   <thead style={{ backgroundColor: "#f2f3f5" }}>
//                     <tr>
//                       <th style={thStyle}>Order #</th>
//                       <th style={thStyle}>Customer</th>
//                       <th style={thStyle}>Status</th>
//                       <th style={thStyle}>Total</th>
//                       <th style={thStyle}>Date</th>
//                       <th style={thStyle}>Items</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredOrders.length > 0 ? (
//                       filteredOrders.map((o) => (
//                         <tr key={o._id} style={{ borderBottom: "1px solid #e6e8ec" }}>
//                           <td style={tdStyle}>
//                             <Text size={1} weight="medium">{o.orderNumber}</Text>
//                           </td>
//                           <td style={tdStyle}>
//                             <Text size={1}>{o.customerName}</Text>
//                           </td>
//                           <td style={tdStyle}>
//                             <Badge tone={getStatusTone(o.status)} mode="outline">
//                               {o.status?.toUpperCase() || "UNKNOWN"}
//                             </Badge>
//                           </td>
//                           <td style={tdStyle}>
//                             <Text size={1} weight="semibold">
//                               LKR {o.total?.toLocaleString() ?? 0}
//                             </Text>
//                           </td>
//                           <td style={tdStyle}>
//                             <Text size={1} muted>
//                               {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "—"}
//                             </Text>
//                           </td>
//                           <td style={tdStyle}>
//                             <Stack space={2}>
//                               {o.items?.map((item, idx) => (
//                                 <Text key={idx} size={1} muted>
//                                   {item.quantity} × {item.productName}
//                                 </Text>
//                               ))}
//                             </Stack>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
//                           <Text muted>No orders found matching your criteria.</Text>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </Card>
//           )}
//         </Stack>
//       </Container>
//     </Card>
//   );
// }

// // Simple Styles for Table (Since Sanity UI doesn't have a Data Table component yet)
// const thStyle: React.CSSProperties = {
//   textAlign: "left",
//   padding: "12px 16px",
//   fontSize: "13px",
//   color: "#6e7683",
//   textTransform: "uppercase",
//   letterSpacing: "0.5px",
//   fontWeight: 600,
// };

// const tdStyle: React.CSSProperties = {
//   padding: "14px 16px",
//   verticalAlign: "middle",
// };