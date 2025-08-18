import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { CartProvider } from "@/context/cart-context";
import { BillSplitting } from "@/components/cart/bill-splitting";
import { ReceiptGenerator } from "@/components/cart/receipt-generator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TableBillPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function TableBillPage({ params }: TableBillPageProps) {
  const { tableId } = await params;

  // Get table with restaurant data
  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
      isActive: true,
    },
    include: {
      restaurant: true,
    },
  });

  if (!table) {
    notFound();
  }

  return (
    <CartProvider>
      <MainLayout restaurant={table.restaurant} tableNumber={table.tableNumber}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button asChild variant="outline" size="sm">
              <Link href={`/table/${tableId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href={`/table/${tableId}/orders`}>View Orders</Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold">แยกบิล</h1>
            <p className="text-muted-foreground">
              Table {table.tableNumber} • {table.restaurant.name}
            </p>
          </div>

          <BillSplitting restaurantId={table.restaurant.id} tableId={tableId} />

          <Separator />

          <ReceiptGenerator restaurant={table.restaurant} table={table} />
        </div>
      </MainLayout>
    </CartProvider>
  );
}
