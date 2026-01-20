import React, { useEffect, useState, useMemo } from "react";
import { definePlugin, useClient } from "sanity";
// 🔹 Import useRouter for navigation
import { useRouter } from "sanity/router";
import { 
  DashboardIcon, 
  SearchIcon, 
  RefreshIcon, 
  EditIcon, 
  CubeIcon, 
  WarningOutlineIcon, 
  BlockElementIcon 
} from "@sanity/icons";
import { 
  Card, 
  Container, 
  Flex, 
  Heading, 
  Stack, 
  Text, 
  TextInput, 
  Button, 
  Badge, 
  Box, 
  Spinner,
  Label,
  Grid,
  Switch
} from "@sanity/ui";

export const stockReportTool = definePlugin({
  name: "stock-report",
  tools: [
    {
      name: "stock-report",
      title: "Stock Report",
      icon: DashboardIcon,
      component: StockReportPage,
    },
  ],
});

// --- Interface ---
interface ProductStock {
  _id: string;
  _type: string;
  name: string;
  sku?: string;
  price?: number;
  openingStock: number;
  stockOut: number;
  available: number;
}

function StockReportPage() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const router = useRouter(); // 🔹 Navigation Hook

  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const [search, setSearch] = useState("");

  // --- 1. Fetch Data ---
  const fetchStock = async () => {
    setLoading(true);
    const query = `*[_type == "product" && !(_id in path("drafts.**"))] | order(name asc) {
      _id,
      _type,
      name,
      sku, 
      price,
      openingStock,
      stockOut,
      "available": coalesce(openingStock, 0) - coalesce(stockOut, 0)
    }`;
    try {
      const data = await client.fetch(query);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // --- 2. Action Handler ---
  const handleEditProduct = (id: string, type: string) => {
    router.navigateIntent("edit", { id, type });
  };

  // --- 3. Filter Logic ---
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filterOutOfStock) return p.available <= 0;
        return true;
      })
      .filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
      );
  }, [products, filterOutOfStock, search]);

  // --- 4. KPI Calculations ---
  const stats = useMemo(() => {
    return filteredProducts.reduce(
      (acc, p) => {
        acc.totalItems += p.available;
        acc.totalValue += (p.available * (p.price || 0));
        if (p.available <= 0) acc.outOfStock++;
        else if (p.available < 10) acc.lowStock++; // Threshold < 10
        return acc;
      },
      { totalItems: 0, totalValue: 0, outOfStock: 0, lowStock: 0 }
    );
  }, [filteredProducts]);

  // Helper for Status Badge
  const getStatusBadge = (available: number) => {
    if (available <= 0) return <Badge tone="critical" mode="outline">Out of Stock</Badge>;
    if (available < 10) return <Badge tone="caution" mode="outline">Low Stock</Badge>;
    return <Badge tone="positive" mode="outline">In Stock</Badge>;
  };

  return (
    <Card height="fill" tone="transparent" padding={[3, 4, 5]} overflow="auto">
      <Container width={5}>
        <Stack space={5}>
          
          {/* --- HEADER --- */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <Heading as="h1" size={3}>Inventory Health</Heading>
              <Text size={1} muted style={{ marginTop: 6 }}>
                Track stock levels and product performance
              </Text>
            </Box>
            <Button 
              icon={RefreshIcon} 
              text="Refresh Data" 
              onClick={fetchStock} 
              mode="ghost" 
              disabled={loading}
              tone="primary"
            />
          </Flex>

          {/* --- KPI CARDS --- */}
          <Grid columns={[1, 1, 3]} gap={3}>
             <StatsCard 
                icon={CubeIcon} 
                label="Total Inventory" 
                value={`${stats.totalItems} Units`}
                subValue={`Est. Value: LKR ${stats.totalValue.toLocaleString()}`}
                tone="primary" 
             />
             <StatsCard 
                icon={WarningOutlineIcon} 
                label="Low Stock Alerts" 
                value={stats.lowStock} 
                tone="caution" 
             />
             <StatsCard 
                icon={BlockElementIcon} 
                label="Out of Stock" 
                value={stats.outOfStock} 
                tone="critical" 
             />
          </Grid>

          {/* --- FILTERS --- */}
          <Card padding={3} radius={2} shadow={1} border>
            <Flex gap={4} align="flex-end" wrap="wrap">
              <Box flex={1} style={{ minWidth: "250px" }}>
                <Label size={1} muted>Search Inventory</Label>
                <TextInput
                  fontSize={2}
                  icon={SearchIcon}
                  placeholder="Search Product Name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  style={{marginTop: 6}}
                />
              </Box>
              
              <Flex align="center" gap={3} paddingBottom={2}>
                <Switch 
                  checked={filterOutOfStock} 
                  onChange={(e) => setFilterOutOfStock(e.currentTarget.checked)} 
                  id="stock-filter"
                />
                <Box>
                  <Text size={1} weight="medium">Out of Stock Only</Text>
                </Box>
              </Flex>
            </Flex>
          </Card>

          {/* --- DATA TABLE --- */}
          {loading ? (
            <Flex align="center" justify="center" padding={6}>
              <Spinner size={3} muted />
            </Flex>
          ) : (
            <Card radius={3} shadow={1} style={{ overflow: "hidden", minHeight: "400px" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <tr>
                      <th style={thStyle}>SKU</th>
                      <th style={thStyle}>Product Name</th>
                      <th style={thStyle} align="right">Price</th>
                      <th style={thStyle} align="center">Opening</th>
                      <th style={thStyle} align="center">Sold</th>
                      <th style={thStyle} align="center">Available</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle} align="center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <tr key={p._id} className="hover-row" style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}>
                          
                          <td style={tdStyle}>
                            <Text size={1} muted style={{fontFamily: 'monospace'}}>{p.sku || "—"}</Text>
                          </td>
                          
                          <td style={tdStyle}>
                            <Text size={2} weight="medium">{p.name}</Text>
                          </td>

                          <td style={tdStyle} align="right">
                            <Text size={1}>LKR {p.price?.toLocaleString() || 0}</Text>
                          </td>

                          <td style={tdStyle} align="center">
                            <Text size={1} muted>{p.openingStock || 0}</Text>
                          </td>
                          
                          <td style={tdStyle} align="center">
                            <Text size={1} muted>{p.stockOut || 0}</Text>
                          </td>
                          
                          <td style={tdStyle} align="center">
                            <Text size={2} weight="bold">{p.available}</Text>
                          </td>
                          
                          <td style={tdStyle}>
                            {getStatusBadge(p.available)}
                          </td>

                          <td style={tdStyle} align="center">
                             <Button 
                                icon={EditIcon}
                                mode="ghost"
                                tone="default"
                                text="Edit"
                                fontSize={1}
                                onClick={() => handleEditProduct(p._id, p._type)}
                             />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: "60px", textAlign: "center" }}>
                          <Stack space={3}>
                             <Text size={2} weight="medium">No products found</Text>
                             <Text size={1} muted>Try adjusting your search</Text>
                          </Stack>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </Stack>
      </Container>
    </Card>
  );
}

// --- HELPER COMPONENTS ---

function StatsCard({ icon: Icon, label, value, subValue, tone }: any) {
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
                    {subValue && (
                        <Text size={1} muted style={{marginTop: 4, opacity: 0.8}}>
                            {subValue}
                        </Text>
                    )}
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
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: "#f9fafb",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 24px",
  verticalAlign: "middle",
};