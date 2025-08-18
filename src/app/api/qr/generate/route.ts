import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tableId } = await request.json();

    if (!tableId) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 },
      );
    }

    // Verify table exists
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Generate the URL that QR code will link to
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/table/${tableId}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    // Update table with QR code data
    await prisma.table.update({
      where: { id: tableId },
      data: { qrCode: qrUrl },
    });

    return NextResponse.json({
      qrCodeUrl: qrCodeDataUrl,
      tableUrl: qrUrl,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        restaurant: table.restaurant.name,
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
