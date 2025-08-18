"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, CartSummary, CartContextType } from "@/types/cart";
import { Menu } from "@/types/database";

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (menu: Menu, quantity: number, customerName: string, notes?: string) => {
      const newItem: CartItem = {
        id: `${menu.id}-${Date.now()}-${Math.random()}`,
        menuId: menu.id,
        menu,
        quantity,
        notes,
        customerName: customerName.trim(),
        addedAt: new Date(),
      };

      setCart((prev) => [...prev, newItem]);
    },
    [],
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCart((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    },
    [removeFromCart],
  );

  const updateCustomerName = useCallback(
    (itemId: string, customerName: string) => {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, customerName: customerName.trim() }
            : item,
        ),
      );
    },
    [],
  );

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, notes: notes.trim() || undefined }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartSummary = useCallback((): CartSummary => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.quantity * Number(item.menu.price),
      0,
    );

    // Group by customer name
    const customerGroups = cart.reduce(
      (groups, item) => {
        const customer = item.customerName || "Unknown";
        if (!groups[customer]) {
          groups[customer] = [];
        }
        groups[customer].push(item);
        return groups;
      },
      {} as Record<string, CartItem[]>,
    );

    return {
      items: cart,
      totalItems,
      totalAmount,
      customerGroups,
    };
  }, [cart]);

  const getCustomerTotal = useCallback(
    (customerName: string): number => {
      return cart
        .filter((item) => item.customerName === customerName)
        .reduce(
          (sum, item) => sum + item.quantity * Number(item.menu.price),
          0,
        );
    },
    [cart],
  );

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCustomerName,
    updateNotes,
    clearCart,
    getCartSummary,
    getCustomerTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
