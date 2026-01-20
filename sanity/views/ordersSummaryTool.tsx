import React, { useEffect, useState, useCallback } from "react";
import { definePlugin, useClient } from "sanity";
// 🔹 Import useRouter for navigation within Studio
import { useRouter } from "sanity/router"; 
import { 
  Card, 
  Container, 
  Flex, 
  Heading, 
  Stack, 
  Text, 
  TextInput, 
  Select, 
  Button, 
  Badge, 
  Box, 
  Spinner,
  Grid,
  Label
} from "@sanity/ui";
import { 
  SearchIcon, 
  RefreshIcon, 
  BasketIcon, 
  BillIcon, 
  ClockIcon, 
  CheckmarkCircleIcon,
  EyeOpenIcon,
  ChevronRightIcon
} from "@sanity/icons";

export const ordersSummaryTool = definePlugin({
  name: "orders-summary",
  tools: [
    {
      name: "orders-summary",
      title: "Pantry Orders",
      component: OrdersSummary,
      icon: BasketIcon,
    },
  ],
});

// --- Interfaces ---
interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  bundleTitle?: string;
  bundleCount?: number;
}

interface Order {
  _id: string;
  _type: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  orderDate: string;
  items: OrderItem[];
}

function OrdersSummary() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const router = useRouter(); // 🔹 Hook for navigation
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 1. Fetch Orders ---
  const fetchOrders = useCallback(() => {
    setLoading(true);
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          _type,
          orderNumber,
          customerName,
          status,
          total,
          orderDate,
          items[]{
            productName,
            quantity,
            price,
            bundleTitle,
            bundleCount
          }
        } | order(orderDate desc)`
      )
      .then(setOrders)
      .catch((err) => {
        console.error(err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- 2. Action Handler ---
  const handleViewOrder = (id: string, type: string) => {
    // Navigate to the "editor" intent for this document
    router.navigateIntent("edit", { id, type });
  };

  // --- 3. Filter Logic ---
  const filteredOrders = orders
    .filter((o) =>
      (o.customerName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (o.orderNumber?.toLowerCase() || "").includes(search.toLowerCase())
    )
    .filter((o) => !filterStatus || o.status === filterStatus);

  // --- 4. Dashboard Stats ---
  const totalRevenue = filteredOrders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
  const deliveredCount = filteredOrders.filter(o => o.status === 'delivered').length;

  // --- 5. Helpers ---
  const getStatusTone = (status?: string) => {
    switch (status) {
      case "pending": return "caution";   
      case "processing": return "primary"; 
      case "shipped": return "primary";    
      case "delivered": return "positive"; 
      case "cancelled": return "critical"; 
      default: return "default";           
    }
  };

  return (
    <Card height="fill" tone="transparent" padding={[3, 4, 5]} overflow="auto">
      <Container width={5}>
        <Stack space={5}>
          
          {/* --- HEADER --- */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Heading as="h1" size={3}>The Balanced Pantry</Heading>
              <Text size={1} muted style={{ marginTop: 6 }}>Order Dashboard</Text>
            </Box>
            <Button 
              icon={RefreshIcon} 
              text="Refresh Data" 
              onClick={fetchOrders} 
              mode="ghost" 
              disabled={loading}
              tone="primary"
            />
          </Flex>

          {/* --- KPI CARDS --- */}
          <Grid columns={[1, 1, 3]} gap={3}>
             <StatsCard 
                icon={BillIcon} 
                label="Total Revenue" 
                value={`LKR ${totalRevenue.toLocaleString()}`} 
                tone="primary" 
             />
             <StatsCard 
                icon={ClockIcon} 
                label="Pending Orders" 
                value={pendingCount} 
                tone="caution" 
             />
             <StatsCard 
                icon={CheckmarkCircleIcon} 
                label="Completed Orders" 
                value={deliveredCount} 
                tone="positive" 
             />
          </Grid>

          {/* --- FILTERS --- */}
          <Card padding={3} radius={2} shadow={1} border>
            <Flex gap={3} align="flex-end" wrap="wrap">
              <Box flex={2} style={{ minWidth: "240px" }}>
                <Label size={1} muted>Search Orders</Label>
                <TextInput
                  fontSize={2}
                  icon={SearchIcon}
                  placeholder="Order ID, Customer Name..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  style={{marginTop: 6}}
                />
              </Box>
              <Box flex={1} style={{ minWidth: "180px" }}>
                <Label size={1} muted>Filter by Status</Label>
                <Select
                  fontSize={2}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.currentTarget.value)}
                  style={{marginTop: 6}}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Box>
            </Flex>
          </Card>

          {/* --- DATA TABLE --- */}
          <Card radius={3} shadow={1} style={{ overflow: "hidden", minHeight: "400px" }}>
            {loading ? (
                <Flex align="center" justify="center" height="fill" padding={6}>
                  <Spinner size={3} muted />
                </Flex>
            ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                    <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <tr>
                        <th style={thStyle}>Order #</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Customer</th>
                        <th style={thStyle}>Items (Bundles)</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle} align="right">Total</th>
                        <th style={thStyle} align="center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((o) => (
                          <tr key={o._id} className="hover-row" style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}>
                            
                            {/* Order # */}
                            <td style={tdStyle}>
                              <Text size={1} weight="semibold" style={{fontFamily: 'monospace'}}>{o.orderNumber}</Text>
                            </td>

                            {/* Date */}
                            <td style={tdStyle}>
                              <Text size={1} muted>
                                {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "—"}
                              </Text>
                            </td>

                            {/* Customer */}
                            <td style={tdStyle}>
                              <Text size={2} weight="medium">{o.customerName}</Text>
                            </td>
                            
                            {/* Items */}
                            <td style={tdStyle}>
                              <Stack space={3}>
                                {o.items?.map((item, idx) => {
                                  const isBundle = item.bundleTitle && item.bundleTitle !== "Single Pack";
                                  return (
                                    <Flex key={idx} align="center" gap={2}>
                                      <Badge tone="default" fontSize={0} mode="outline">{item.quantity}x</Badge>
                                      <Box>
                                         <Text size={1} weight="medium">{item.productName}</Text>
                                         {isBundle && (
                                            <Text size={0} muted style={{color: '#d97706',marginTop: 4}}>
                                              {item.bundleTitle} ({item.bundleCount} packs)
                                            </Text>
                                         )}
                                      </Box>
                                    </Flex>
                                  );
                                })}
                              </Stack>
                            </td>

                            {/* Status */}
                            <td style={tdStyle}>
                              <Badge tone={getStatusTone(o.status)} mode="outline" fontSize={1}>
                                {o.status?.toUpperCase() || "UNKNOWN"}
                              </Badge>
                            </td>

                            {/* Total */}
                            <td style={tdStyle} align="right">
                              <Text size={2} weight="bold">
                                LKR {o.total?.toLocaleString() ?? 0}
                              </Text>
                            </td>

                            {/* Action Button */}
                            <td style={tdStyle} align="center">
                                <Button 
                                    icon={EyeOpenIcon}
                                    mode="ghost"
                                    tone="default"
                                    text="View"
                                    fontSize={1}
                                    onClick={() => handleViewOrder(o._id, o._type)}
                                />
                            </td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ padding: "80px", textAlign: "center" }}>
                            <Stack space={3}>
                               <Text size={2} weight="medium">No orders found</Text>
                               <Text size={1} muted>Try adjusting your filters</Text>
                            </Stack>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            )}
          </Card>

        </Stack>
      </Container>
    </Card>
  );
}

// --- HELPER COMPONENTS ---

function StatsCard({ icon: Icon, label, value, tone }: any) {
    return (
        <Card padding={4} radius={3} shadow={1} tone={tone}>
            <Flex align="center" gap={3}>
                <Box padding={3} style={{background: 'rgba(255,255,255,0.3)', borderRadius: '50%'}}>
                    <Icon style={{fontSize: 28}} />
                </Box>
                <Box>
                    <Text size={1} weight="semibold" style={{opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                        {label}
                    </Text>
                    <Heading size={3} style={{marginTop: 6}}>
                        {value}
                    </Heading>
                </Box>
            </Flex>
        </Card>
    )
}

// --- STYLES ---
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px 24px",
  fontSize: "11px",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 700,
  position: "sticky", // Sticky Header
  top: 0,
  zIndex: 10,
  backgroundColor: "#f9fafb", // Match thead background
};

const tdStyle: React.CSSProperties = {
  padding: "16px 24px",
  verticalAlign: "middle",
};