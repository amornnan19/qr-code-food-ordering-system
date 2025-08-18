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

// GET - Fetch all menu items
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const menuItems = await prisma.menu.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 },
    );
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { name, description, price, categoryId, imageUrl, isAvailable } =
      await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 },
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const menuItem = await prisma.menu.create({
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

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Menu create error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  }
}
