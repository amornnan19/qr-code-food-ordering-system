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

// GET - Get restaurant info
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const restaurant = await prisma.restaurant.findFirst();
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Restaurant fetch error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 },
    );
  }
}

// POST - Create restaurant
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const { name, description, address, phone } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 },
      );
    }

    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findFirst();
    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant already exists. Use PUT to update." },
        { status: 409 },
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        phone: phone || null,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Restaurant creation error:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 },
    );
  }
}