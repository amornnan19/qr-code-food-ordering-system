import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!tableId) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 }
      );
    }

    // Get table with current session
    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
        isActive: true,
      },
      select: {
        id: true,
        currentSessionId: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // If no session ID provided, check if table has current session
    if (!sessionId) {
      return NextResponse.json({
        valid: false,
        reason: "No session ID provided",
        hasActiveSession: !!table.currentSessionId,
      });
    }

    // Check if provided session matches current session
    const isValid = table.currentSessionId === sessionId;

    return NextResponse.json({
      valid: isValid,
      reason: isValid ? "Valid session" : "Session expired or invalid",
      hasActiveSession: !!table.currentSessionId,
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate session" },
      { status: 500 }
    );
  }
}