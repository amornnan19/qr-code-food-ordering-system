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

// GET - Fetch all tables
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const tables = await prisma.table.findMany({
      orderBy: {
        tableNumber: "asc",
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Tables fetch error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 }
    );
  }
}

// POST - Create new table
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { tableNumber, location, notes, isActive } = await request.json();

    if (!tableNumber) {
      return NextResponse.json(
        { error: "Table number is required" },
        { status: 400 }
      );
    }

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: { tableNumber },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    // Get restaurant (assuming single restaurant for now)
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json(
        { error: "No restaurant found. Please set up a restaurant first." },
        { status: 400 }
      );
    }

    const table = await prisma.table.create({
      data: {
        tableNumber,
        location: location || null,
        notes: notes || null,
        isActive: isActive ?? true,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("Table create error:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}