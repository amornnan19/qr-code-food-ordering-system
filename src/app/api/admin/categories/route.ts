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

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    verifyAdminToken(authHeader);

    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "Unauthorized or internal server error" },
      { status: 401 }
    );
  }
}