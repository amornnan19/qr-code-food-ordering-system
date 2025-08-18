"use client";

import { useState, useMemo } from "react";
import { CategoryWithMenus } from "@/types/database";
import { MenuItemCard } from "./menu-item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { CartSummary } from "@/components/cart/cart-summary";

interface MenuDisplayProps {
  categories: CategoryWithMenus[];
  restaurantId: string;
  tableId: string;
}

export function MenuDisplay({
  categories,
  restaurantId,
  tableId,
}: MenuDisplayProps) {
  const { getCartSummary } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id || "",
  );

  const cartSummary = getCartSummary();

  // Filter menus based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    return categories
      .map((category) => ({
        ...category,
        menus: category.menus.filter(
          (menu) =>
            menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((category) => category.menus.length > 0);
  }, [categories, searchQuery]);

  // Get active categories (with available items)
  const activeCategories = filteredCategories.filter(
    (category) =>
      category.isActive && category.menus.some((menu) => menu.isActive),
  );

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchQuery
            ? "No items found for your search."
            : "No menu items available at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-base"
        />
      </div>

      {/* Search Results Summary */}
      {searchQuery && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredCategories.reduce((sum, cat) => sum + cat.menus.length, 0)}{" "}
            items found
          </Badge>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {activeCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs sm:text-sm"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {
                  category.menus.filter((m) => m.isActive && m.isAvailable)
                    .length
                }
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Menu Items */}
        {activeCategories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {category.menus
                .filter((menu) => menu.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((menu) => (
                  <MenuItemCard key={menu.id} menu={{ ...menu, category }} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating Cart Button */}
      {cartSummary.totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <CartSummary restaurantId={restaurantId} tableId={tableId}>
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart ({cartSummary.totalItems})
            </Button>
          </CartSummary>
        </div>
      )}
    </div>
  );
}
