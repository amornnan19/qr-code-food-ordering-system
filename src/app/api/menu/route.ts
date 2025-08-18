import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 },
      );
    }

    // Get categories with their menus
    const categories = await prisma.category.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      include: {
        menus: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Filter out categories with no active menus
    const categoriesWithMenus = categories.filter(
      (category) => category.menus.length > 0,
    );

    return NextResponse.json({
      categories: categoriesWithMenus,
      total: categoriesWithMenus.reduce(
        (sum, cat) => sum + cat.menus.length,
        0,
      ),
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 },
    );
  }
}
