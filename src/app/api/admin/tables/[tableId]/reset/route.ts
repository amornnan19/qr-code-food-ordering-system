import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    // Verify admin auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
    
    try {
      jwt.verify(token, jwtSecret);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { tableId } = await params;

    if (!tableId) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Verify table exists
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        orders: {
          where: {
            status: {
              notIn: ["SERVED", "CANCELLED"]
            }
          }
        }
      }
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Cancel any pending orders for this table
    if (table.orders.length > 0) {
      await prisma.order.updateMany({
        where: {
          tableId: tableId,
          status: {
            notIn: ["SERVED", "CANCELLED"]
          }
        },
        data: {
          status: "CANCELLED"
        }
      });
    }

    // Generate new session ID and QR code URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const newQrUrl = `${baseUrl}/table/${tableId}?session=${newSessionId}`;

    // Update table with new QR code and current session
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { 
        qrCode: newQrUrl,
        currentSessionId: newSessionId
      },
      include: {
        restaurant: true,
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  notIn: ["SERVED", "CANCELLED"]
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Table reset successfully",
      table: updatedTable,
      cancelledOrders: table.orders.length
    });
  } catch (error) {
    console.error("Reset table error:", error);
    return NextResponse.json(
      { error: "Failed to reset table" },
      { status: 500 }
    );
  }
}