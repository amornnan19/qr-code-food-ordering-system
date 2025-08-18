"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  Users,
  DollarSign,
} from "lucide-react";
import { Order, OrderItem, Menu, Table } from "@/types/database";

type OrderWithDetails = Order & {
  table: Table;
  orderItems: (OrderItem & {
    menu: Menu;
  })[];
};

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "SERVED", label: "Served" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.table.tableNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getOrderTotal = (order: OrderWithDetails) => {
    return order.orderItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.menu.price),
      0,
    );
  };

  const activeOrders = orders.filter(
    (order) => !["SERVED", "CANCELLED"].includes(order.status),
  );
  const todayRevenue = orders
    .filter((order) => {
      const today = new Date();
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + getOrderTotal(order), 0);

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading orders...</p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Order Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage all restaurant orders
              </p>
            </div>
            <Button
              onClick={refreshOrders}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Active Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {activeOrders.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Orders in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Total Orders Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    orders.filter((order) => {
                      const today = new Date();
                      const orderDate = new Date(order.createdAt);
                      return orderDate.toDateString() === today.toDateString();
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  All orders received today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Revenue Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ฿{todayRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue for today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, table, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderTotal = getOrderTotal(order);
              const orderTime = new Date(order.createdAt).toLocaleString(
                "th-TH",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Order #{order.id.slice(0, 8)}
                          <OrderStatusBadge status={order.status} />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Table {order.table.tableNumber} • {orderTime}
                          {order.customerName && ` • ${order.customerName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ฿{orderTotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.orderItems.length} items
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.menu.name} x{item.quantity}
                            {item.notes && (
                              <span className="text-muted-foreground ml-2">
                                ({item.notes})
                              </span>
                            )}
                          </span>
                          <span>
                            ฿
                            {(Number(item.menu.price) * item.quantity).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Status Actions */}
                    {!["SERVED", "CANCELLED"].includes(order.status) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {order.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "CONFIRMED")
                            }
                          >
                            Confirm Order
                          </Button>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "PREPARING")
                            }
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === "PREPARING" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "READY")}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "READY" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "SERVED")
                            }
                          >
                            Mark Served
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateOrderStatus(order.id, "CANCELLED")
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Orders will appear here as customers place them"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
