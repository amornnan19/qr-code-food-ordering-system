"use client";

import { useState, useEffect } from "react";
import { OrderWithItems, OrderStatus } from "@/types/database";
import { OrderCard } from "./order-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersListProps {
  restaurantId: string;
  tableId?: string;
  showControls?: boolean;
}

export function OrdersList({
  restaurantId,
  tableId,
  showControls = false,
}: OrdersListProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ restaurantId });
      if (tableId) params.append("tableId", tableId);

      const response = await fetch(`/api/orders?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      alert(
        `Failed to update order: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId, tableId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return orders;
    if (status === "active") {
      return orders.filter((order) =>
        [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
        ].includes(order.status),
      );
    }
    return orders.filter((order) => order.status === status);
  };

  const getTabCount = (status: string) => {
    return filterOrdersByStatus(status).length;
  };

  const statusTabs = [
    { value: "all", label: "ทั้งหมด" },
    { value: "active", label: "Active" },
    { value: OrderStatus.PENDING, label: "รอดำเนินการ" },
    { value: OrderStatus.PREPARING, label: "กำลังทำ" },
    { value: OrderStatus.READY, label: "พร้อมเสิร์ฟ" },
    { value: OrderStatus.SERVED, label: "เสิร์ฟแล้ว" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Orders</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading orders: {error}
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Orders{" "}
          {tableId && `- Table ${orders[0]?.table.tableNumber || tableId}`}
        </h2>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount(tab.value)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterOrdersByStatus(tab.value).length > 0 ? (
                filterOrdersByStatus(tab.value)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={
                        showControls ? updateOrderStatus : undefined
                      }
                      showControls={showControls}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  ไม่มีออเดอร์ในหมวดนี้
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
