import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all tables for a restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      include: { restaurant: true },
      orderBy: { tableNumber: "asc" },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

// POST create new table
export async function POST(request: NextRequest) {
  try {
    const { restaurantId, tableNumber, seats } = await request.json();

    if (!restaurantId || !tableNumber) {
      return NextResponse.json(
        { error: "Restaurant ID and table number are required" },
        { status: 400 }
      );
    }

    // Check if table number already exists for this restaurant
    const existingTable = await prisma.table.findUnique({
      where: {
        restaurantId_tableNumber: {
          restaurantId,
          tableNumber: tableNumber.toString(),
        },
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 409 }
      );
    }

    const table = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber: tableNumber.toString(),
        seats: seats || 4,
        qrCode: "", // Will be generated when QR is created
      },
      include: { restaurant: true },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}