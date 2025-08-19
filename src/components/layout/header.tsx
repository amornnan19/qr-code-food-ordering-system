"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Restaurant } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Receipt, ShoppingBag } from "lucide-react";

interface HeaderProps {
  restaurant?: Restaurant;
  tableNumber?: string;
}

export function Header({ restaurant, tableNumber }: HeaderProps) {
  const pathname = usePathname();
  const tableId = pathname.split("/")[2]; // Extract tableId from /table/[tableId]/...

  const isTablePage = pathname.includes("/table/") && tableId;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">
            {restaurant?.name || "QR Food Order"}
          </h1>
          {tableNumber && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Badge variant="secondary">Table {tableNumber}</Badge>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Navigation buttons for table pages */}
          {isTablePage && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/table/${tableId}/orders`}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/table/${tableId}/bill`}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Bill
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {restaurant?.logoUrl && (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
        </div>
      </div>
    </header>
  );
}
