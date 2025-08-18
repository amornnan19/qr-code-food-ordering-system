import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });

    // Get active orders (not completed or cancelled)
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "READY"],
        },
      },
    });

    // Calculate stats
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce(
        (itemSum, item) => itemSum + (item.quantity * Number(item.menu.price)),
        0
      );
      return sum + orderTotal;
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      activeOrders,
      averageOrderValue,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 }
    );
  }
}