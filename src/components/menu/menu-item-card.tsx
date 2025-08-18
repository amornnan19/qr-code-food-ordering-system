"use client";

import { useState } from "react";
import { MenuWithCategory } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface MenuItemCardProps {
  menu: MenuWithCategory;
  onAddToCart: (menuId: string, quantity: number, notes?: string) => void;
}

export function MenuItemCard({ menu, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    onAddToCart(menu.id, quantity, notes.trim() || undefined);
    setQuantity(1);
    setNotes("");
  };

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

        {menu.isAvailable && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Label htmlFor={`quantity-${menu.id}`} className="text-sm font-medium">
                Quantity:
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`notes-${menu.id}`} className="text-sm">
                Special requests (optional)
              </Label>
              <Input
                id={`notes-${menu.id}`}
                placeholder="e.g., no spicy, extra sauce..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
            >
              Add to Cart - ฿{(menu.price * quantity).toFixed(2)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}