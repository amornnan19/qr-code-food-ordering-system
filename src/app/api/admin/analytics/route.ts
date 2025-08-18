import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header");
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: {
          include: {
            menu: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Get active orders (not completed/cancelled)
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "READY"],
        },
      },
    });

    // Calculate summary stats
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce(
        (itemSum, item) => itemSum + item.quantity * Number(item.menu.price),
        0,
      );
      return sum + orderTotal;
    }, 0);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate daily sales
    const dailySalesMap = new Map<
      string,
      { revenue: number; orders: number }
    >();

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      const orderTotal = order.orderItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.menu.price),
        0,
      );

      if (dailySalesMap.has(date)) {
        const existing = dailySalesMap.get(date)!;
        dailySalesMap.set(date, {
          revenue: existing.revenue + orderTotal,
          orders: existing.orders + 1,
        });
      } else {
        dailySalesMap.set(date, {
          revenue: orderTotal,
          orders: 1,
        });
      }
    });

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate popular items
    const menuItemsMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        totalOrdered: number;
        revenue: number;
      }
    >();

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = item.menuId;
        const revenue = item.quantity * Number(item.menu.price);

        if (menuItemsMap.has(key)) {
          const existing = menuItemsMap.get(key)!;
          menuItemsMap.set(key, {
            ...existing,
            totalOrdered: existing.totalOrdered + item.quantity,
            revenue: existing.revenue + revenue,
          });
        } else {
          menuItemsMap.set(key, {
            id: item.menu.id,
            name: item.menu.name,
            category: item.menu.category.name,
            totalOrdered: item.quantity,
            revenue,
          });
        }
      });
    });

    const popularItems = Array.from(menuItemsMap.values()).sort(
      (a, b) => b.totalOrdered - a.totalOrdered,
    );

    // Calculate hourly data
    const hourlyData: { hour: number; orders: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const orderCount = orders.filter((order) => {
        const orderHour = order.createdAt.getHours();
        return orderHour === hour;
      }).length;

      hourlyData.push({ hour, orders: orderCount });
    }

    const analytics = {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        activeOrders,
      },
      dailySales,
      popularItems,
      hourlyData,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 },
    );
  }
}
