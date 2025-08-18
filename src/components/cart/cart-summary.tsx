"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Minus, Plus, ShoppingCart, Users, Eye, Calculator } from "lucide-react";
import Link from "next/link";

interface CartSummaryProps {
  children: React.ReactNode;
  restaurantId: string;
  tableId: string;
}

export function CartSummary({ children, restaurantId, tableId }: CartSummaryProps) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateCustomerName,
    updateNotes,
    clearCart,
    getCartSummary,
    submitOrder,
  } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cartSummary = getCartSummary();

  if (cart.length === 0) {
    return null;
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find((item) => item.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + delta);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitOrder(restaurantId, tableId);
      
      if (result.success) {
        alert("Order submitted successfully!");
        setIsOpen(false);
      } else {
        alert(`Failed to submit order: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerNames = Object.keys(cartSummary.customerGroups);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Cart Summary</span>
            <Badge variant="secondary">{cartSummary.totalItems} items</Badge>
          </SheetTitle>
          <SheetDescription>
            Review your order and split bills by customer
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Groups */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <h3 className="font-medium">Orders by Customer</h3>
            </div>

            {customerNames.map((customerName) => {
              const customerItems = cartSummary.customerGroups[customerName];
              const customerTotal = customerItems.reduce(
                (sum, item) => sum + item.quantity * Number(item.menu.price),
                0,
              );

              return (
                <div key={customerName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-primary">{customerName}</h4>
                    <Badge variant="outline">฿{customerTotal.toFixed(2)}</Badge>
                  </div>

                  <div className="space-y-2">
                    {customerItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-muted/30 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">
                              {item.menu.name}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              ฿{item.menu.price.toString()} each
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-medium">
                            ฿
                            {(item.quantity * Number(item.menu.price)).toFixed(
                              2,
                            )}
                          </span>
                        </div>

                        {/* Edit Customer Name */}
                        <div className="space-y-1">
                          <Label
                            htmlFor={`customer-${item.id}`}
                            className="text-xs"
                          >
                            Customer Name
                          </Label>
                          <Input
                            id={`customer-${item.id}`}
                            value={item.customerName}
                            onChange={(e) =>
                              updateCustomerName(item.id, e.target.value)
                            }
                            className="text-xs"
                          />
                        </div>

                        {/* Edit Notes */}
                        <div className="space-y-1">
                          <Label
                            htmlFor={`notes-${item.id}`}
                            className="text-xs"
                          >
                            Special Requests
                          </Label>
                          <Input
                            id={`notes-${item.id}`}
                            value={item.notes || ""}
                            onChange={(e) =>
                              updateNotes(item.id, e.target.value)
                            }
                            placeholder="Add special requests..."
                            className="text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Items:</span>
              <span>{cartSummary.totalItems}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Grand Total:</span>
              <span>฿{cartSummary.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full" 
              size="lg"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/table/${tableId}/orders`}>
                  <Eye className="mr-1 h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/table/${tableId}/bill`}>
                  <Calculator className="mr-1 h-4 w-4" />
                  แยกบิล
                </Link>
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={isSubmitting}
              className="w-full text-destructive hover:text-destructive"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
