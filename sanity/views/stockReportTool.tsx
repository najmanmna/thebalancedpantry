// src/sanity/tools/stockReportTool.tsx
import React, { useEffect, useState, useMemo } from "react";
import { definePlugin } from "sanity";
import { useClient } from "sanity";
import { DashboardIcon, SearchIcon, RefreshIcon } from "@sanity/icons";
import { 
  Card, 
  Container, 
  Flex, 
  Heading, 
  Stack, 
  Text, 
  TextInput, 
  Switch, 
  Button, 
  Badge, 
  Box, 
  Spinner,
  Label
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

function StockReportPage() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const [search, setSearch] = useState("");

  const fetchStock = async () => {
    setLoading(true);
    // 🔹 UPDATED QUERY: Simplified schema fields
    const query = `*[_type == "product" && !(_id in path("drafts.**"))] | order(name asc) {
      _id,
      name,
      sku, // or itemCode if you kept that name
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

  const totals = useMemo(() => {
    return filteredProducts.reduce(
      (acc, p) => {
        acc.openingStock += p.openingStock || 0;
        acc.stockOut += p.stockOut || 0;
        acc.available += p.available || 0;
        return acc;
      },
      { openingStock: 0, stockOut: 0, available: 0 }
    );
  }, [filteredProducts]);

  // Helper for Status Badge
  const getStatusBadge = (available: number) => {
    if (available <= 0) return <Badge tone="critical">Out of Stock</Badge>;
    if (available <= 5) return <Badge tone="caution">Low Stock</Badge>;
    return <Badge tone="positive">In Stock</Badge>;
  };

  return (
    <Card height="fill" tone="transparent" padding={4} overflow="auto">
      <Container width={4}>
        <Stack space={5}>
          
          {/* --- HEADER --- */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading as="h1" size={3}>📦 Stock Report</Heading>
              <Text size={1} muted style={{ marginTop: 8 }}>
                Monitor inventory levels and sales
              </Text>
            </Box>
            <Button 
              icon={RefreshIcon} 
              text="Refresh" 
              onClick={fetchStock} 
              mode="ghost" 
              disabled={loading}
            />
          </Flex>

          {/* --- FILTERS --- */}
          <Card padding={3} radius={2} shadow={1}>
            <Flex gap={4} align="center" wrap="wrap">
              <Box flex={1} style={{ minWidth: "250px" }}>
                <TextInput
                  fontSize={2}
                  icon={SearchIcon}
                  placeholder="Search product name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </Box>
              
              <Flex align="center" gap={3}>
                <Switch 
                  checked={filterOutOfStock} 
                  onChange={(e) => setFilterOutOfStock(e.currentTarget.checked)} 
                  id="stock-filter"
                />
                <Box>
                  <Text size={1} weight="medium">Show Out of Stock Only</Text>
                  <Label size={0} muted>Hide available items</Label>
                </Box>
              </Flex>
            </Flex>
          </Card>

          {/* --- DATA TABLE --- */}
          {loading ? (
            <Flex align="center" justify="center" padding={5}>
              <Spinner size={3} />
            </Flex>
          ) : (
            <Card radius={2} shadow={1} style={{ overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead style={{ backgroundColor: "#f2f3f5" }}>
                    <tr>
                      <th style={thStyle}>SKU</th>
                      <th style={thStyle}>Product Name</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Opening</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Sold</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Available</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <tr key={p._id} style={{ borderBottom: "1px solid #e6e8ec" }}>
                          <td style={tdStyle}>
                            <Text size={1} muted>{p.sku || "—"}</Text>
                          </td>
                          <td style={tdStyle}>
                            <Text size={1} weight="medium">{p.name}</Text>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <Text size={1}>{p.openingStock || 0}</Text>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <Text size={1}>{p.stockOut || 0}</Text>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <Text size={1} weight="bold">{p.available}</Text>
                          </td>
                          <td style={tdStyle}>
                            {getStatusBadge(p.available)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>
                          <Text muted>No products found.</Text>
                        </td>
                      </tr>
                    )}
                    
                    {/* --- TOTALS ROW --- */}
                    {filteredProducts.length > 0 && (
                      <tr style={{ backgroundColor: "#fafbfc", borderTop: "2px solid #e6e8ec" }}>
                        <td style={tdStyle} colSpan={2}>
                          <Text weight="bold" size={1}>TOTALS</Text>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <Text weight="bold" size={1}>{totals.openingStock}</Text>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <Text weight="bold" size={1}>{totals.stockOut}</Text>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <Text weight="bold" size={1}>{totals.available}</Text>
                        </td>
                        <td style={tdStyle}></td>
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

// Simple Styles for Table Headers/Cells
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: "13px",
  color: "#6e7683",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};