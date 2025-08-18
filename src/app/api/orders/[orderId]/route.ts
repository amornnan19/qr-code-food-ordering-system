import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@/generated/prisma";

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { menu: { include: { category: true } } },
        },
        table: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const { status, notes } = await request.json();

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "SERVED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      include: {
        orderItems: {
          include: { menu: true },
        },
        table: true,
        restaurant: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

// DELETE - Cancel order (only if PENDING)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot cancel order that is not pending" },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
