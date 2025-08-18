"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Medal,
} from "lucide-react";

interface AnalyticsData {
  dailySales: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  popularItems: {
    id: string;
    name: string;
    totalOrdered: number;
    revenue: number;
    category: string;
  }[];
  hourlyData: {
    hour: number;
    orders: number;
  }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    activeOrders: number;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!analytics) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load analytics data
            </p>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  const formatCurrency = (amount: number) => `฿${amount.toLocaleString()}`;
  const getRangeLabel = (range: string) => {
    switch (range) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      default:
        return range;
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">
                Restaurant performance and insights
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getRangeLabel(range)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.summary.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getRangeLabel(timeRange)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.summary.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getRangeLabel(timeRange)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.summary.averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per order average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Orders
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.summary.activeOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently being prepared
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Popular Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="mr-2 h-5 w-5" />
                  Popular Items ({getRangeLabel(timeRange)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularItems.slice(0, 10).map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-amber-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.category} • {item.totalOrdered} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {analytics.popularItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Medal className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No orders yet</p>
                      <p className="text-sm">
                        Popular items will appear here once customers start
                        ordering
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Daily Sales ({getRangeLabel(timeRange)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.dailySales.slice(0, 10).map((day) => {
                    const date = new Date(day.date).toLocaleDateString(
                      "th-TH",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    );

                    return (
                      <div
                        key={day.date}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{date}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.orders} orders
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(day.revenue)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {analytics.dailySales.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No sales data yet</p>
                      <p className="text-sm">
                        Daily sales will appear here once orders are placed
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Peak Hours ({getRangeLabel(timeRange)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {analytics.hourlyData.map((hour) => {
                  const maxOrders = Math.max(
                    ...analytics.hourlyData.map((h) => h.orders),
                  );
                  const height =
                    maxOrders > 0 ? (hour.orders / maxOrders) * 100 : 0;

                  return (
                    <div key={hour.hour} className="text-center">
                      <div className="relative h-20 mb-2">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium">{hour.hour}:00</p>
                        <p className="text-muted-foreground">{hour.orders}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Number of orders placed by hour
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
