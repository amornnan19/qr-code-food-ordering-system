import { Menu } from "./database";

export interface CartItem {
  id: string;
  menuId: string;
  menu: Menu;
  quantity: number;
  notes?: string;
  customerName: string;
  addedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  customerGroups: Record<string, CartItem[]>;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (
    menu: Menu,
    quantity: number,
    customerName: string,
    notes?: string,
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomerName: (itemId: string, customerName: string) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  getCartSummary: () => CartSummary;
  getCustomerTotal: (customerName: string) => number;
}
