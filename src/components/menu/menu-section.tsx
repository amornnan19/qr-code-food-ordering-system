"use client";

import { useEffect, useState } from "react";
import { CategoryWithMenus } from "@/types/database";
import { MenuDisplay } from "./menu-display";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuSectionProps {
  restaurantId: string;
}

export function MenuSection({ restaurantId }: MenuSectionProps) {
  const [categories, setCategories] = useState<CategoryWithMenus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load menu</p>
        <p className="text-muted-foreground text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No menu items available at the moment.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check back later or contact the restaurant.
        </p>
      </div>
    );
  }

  return <MenuDisplay categories={categories} />;
}
