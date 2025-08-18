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

// PUT - Update table
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { tableId } = await params;
    const { tableNumber, location, notes, isActive } = await request.json();

    if (!tableNumber) {
      return NextResponse.json(
        { error: "Table number is required" },
        { status: 400 }
      );
    }

    // Verify table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check if table number is taken by another table
    const duplicateTable = await prisma.table.findFirst({
      where: { 
        tableNumber,
        id: { not: tableId }
      },
    });

    if (duplicateTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: {
        tableNumber,
        location: location || null,
        notes: notes || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Table update error:", error);
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    );
  }
}

// DELETE - Delete table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { tableId } = await params;

    // Verify table exists
    const existingTable = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check if table has any orders
    const ordersCount = await prisma.order.count({
      where: { tableId },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete table that has orders. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Table delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}