"use client";

import { Restaurant } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  restaurant?: Restaurant;
  tableNumber?: string;
}

export function Header({ restaurant, tableNumber }: HeaderProps) {
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
          {restaurant?.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
        </div>
      </div>
    </header>
  );
}