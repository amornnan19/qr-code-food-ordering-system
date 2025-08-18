"use client";

import { MenuWithCategory } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";

interface MenuItemCardProps {
  menu: MenuWithCategory;
}

export function MenuItemCard({ menu }: MenuItemCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{menu.name}</CardTitle>
            {menu.description && (
              <CardDescription className="text-sm line-clamp-2">
                {menu.description}
              </CardDescription>
            )}
          </div>
          {menu.imageUrl && (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-16 h-16 rounded-lg object-cover ml-4"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            ฿{menu.price.toString()}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={menu.isAvailable ? "default" : "secondary"}>
              {menu.isAvailable ? "Available" : "Sold Out"}
            </Badge>
            <Badge variant="outline">{menu.category.name}</Badge>
          </div>
        </div>

        {menu.isAvailable ? (
          <AddToCartDialog menu={menu}>
            <Button className="w-full" size="lg">
              Add to Cart - ฿{menu.price.toString()}
            </Button>
          </AddToCartDialog>
        ) : (
          <Button disabled className="w-full" size="lg">
            Sold Out
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
