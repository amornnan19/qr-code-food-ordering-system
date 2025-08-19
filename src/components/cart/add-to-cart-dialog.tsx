"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuWithCategory } from "@/types/database";
import { useCart } from "@/context/cart-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface AddToCartDialogProps {
  menu: MenuWithCategory;
  children: React.ReactNode;
}

export function AddToCartDialog({ menu, children }: AddToCartDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const { addToCart } = useCart();

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    addToCart(menu, quantity, customerName.trim(), notes.trim() || undefined);

    // Reset form
    setQuantity(1);
    setCustomerName("");
    setNotes("");
    setIsOpen(false);

    // Show success message
    alert(`Added ${quantity} x ${menu.name} for ${customerName.trim()}`);
  };

  const totalPrice = Number(menu.price) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add to Cart
            {menu.imageUrl && (
              <Image
                src={menu.imageUrl}
                alt={menu.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
          </DialogTitle>
          <DialogDescription className="text-left">
            Select quantity and customer name for this item
          </DialogDescription>
        </DialogHeader>

        {/* Menu Item Info */}
        <div className="space-y-2 border-b pb-4">
          <h3 className="font-medium text-foreground">{menu.name}</h3>
          {menu.description && (
            <p className="text-sm text-muted-foreground">{menu.description}</p>
          )}
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{menu.category.name}</Badge>
            <span className="text-lg font-bold text-primary">
              ฿{menu.price.toString()}
            </span>
          </div>
        </div>

        <div className="space-y-4 py-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium">
              Customer Name *
            </Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center space-x-3">
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

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Special Requests (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="e.g., no spicy, extra sauce..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={!customerName.trim()}
            className="flex items-center"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart - ฿{totalPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
