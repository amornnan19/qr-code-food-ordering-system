import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/types/database";

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const { restaurantId, tableId, customerName, items } = await request.json();

    if (!restaurantId || !tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify table exists
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    });

    if (!table || table.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Invalid table" }, { status: 404 });
    }

    // Calculate total amount
    const menuIds = items.map((item: any) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });

    const totalAmount = items.reduce((sum: number, item: any) => {
      const menu = menus.find((m) => m.id === item.menuId);
      return sum + (menu ? Number(menu.price) * item.quantity : 0);
    }, 0);

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORDER-${Date.now()}-${orderCount + 1}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableId,
        orderNumber,
        totalAmount,
        customerName: customerName || null,
        status: OrderStatus.PENDING,
        orderItems: {
          create: items.map((item: any) => {
            const menu = menus.find((m) => m.id === item.menuId);
            return {
              menuId: item.menuId,
              quantity: item.quantity,
              price: menu ? menu.price : 0,
              notes: item.notes || null,
            };
          }),
        },
      },
      include: {
        orderItems: {
          include: { menu: true },
        },
        table: true,
        restaurant: true,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// GET - Get orders (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");

    const whereClause: any = {};

    if (restaurantId) whereClause.restaurantId = restaurantId;
    if (tableId) whereClause.tableId = tableId;
    if (status) whereClause.status = status as OrderStatus;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: { menu: true },
        },
        table: true,
        restaurant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
