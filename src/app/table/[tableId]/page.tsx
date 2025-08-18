import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { MenuSection } from "@/components/menu/menu-section";

interface TablePageProps {
  params: Promise<{ tableId: string }>;
}

export default async function TablePage({ params }: TablePageProps) {
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
    <MainLayout restaurant={table.restaurant} tableNumber={table.tableNumber}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            Welcome to {table.restaurant.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Table {table.tableNumber} • {table.seats} seats
          </p>
          {table.restaurant.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {table.restaurant.description}
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Browse our menu and place your order directly from your phone!
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📱 No app download required</p>
            <p>🍽️ Orders go directly to the kitchen</p>
            <p>💰 Split bills easily by name</p>
          </div>
        </div>

        {/* Menu Display */}
        <MenuSection restaurantId={table.restaurant.id} />
      </div>
    </MainLayout>
  );
}
