import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { OrdersList } from "@/components/orders/orders-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TableOrdersPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function TableOrdersPage({ params }: TableOrdersPageProps) {
  const { tableId } = await params;

  // Get table with restaurant data
  const table = await prisma.table.findUnique({
    where: { 
      id: tableId,
      isActive: true 
    },
    include: { 
      restaurant: true 
    },
  });

  if (!table) {
    notFound();
  }

  return (
    <MainLayout 
      restaurant={table.restaurant} 
      tableNumber={table.tableNumber}
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/table/${tableId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
        </div>

        <OrdersList 
          restaurantId={table.restaurant.id}
          tableId={tableId}
          showControls={false} // Customers can't control status
        />
      </div>
    </MainLayout>
  );
}