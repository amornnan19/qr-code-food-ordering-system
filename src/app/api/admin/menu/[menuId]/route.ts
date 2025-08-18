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

// PUT - Update menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { menuId } = await params;
    const { name, description, price, categoryId, imageUrl, isAvailable } =
      await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 },
      );
    }

    // Verify menu item exists
    const existingItem = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const menuItem = await prisma.menu.update({
      where: { id: menuId },
      data: {
        name,
        description: description || null,
        price,
        categoryId,
        imageUrl: imageUrl || null,
        isAvailable: isAvailable ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Menu update error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 },
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { menuId } = await params;

    // Verify menu item exists
    const existingItem = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    // Check if item is used in any orders (optional - you might want to soft delete instead)
    const orderItemsCount = await prisma.orderItem.count({
      where: { menuId },
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete menu item that has been ordered. Consider marking it as unavailable instead.",
        },
        { status: 400 },
      );
    }

    await prisma.menu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Menu delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}
