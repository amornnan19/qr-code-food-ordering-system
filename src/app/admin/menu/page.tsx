"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import { Menu, Category } from "@/types/database";
import { MenuDialog } from "@/components/admin/menu-dialog";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { RestaurantSetupDialog } from "@/components/admin/restaurant-setup-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<(Menu & { category: Category })[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [restaurantSetupOpen, setRestaurantSetupOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Menu | null>(null);
  const [deletingItem, setDeletingItem] = useState<Menu | null>(null);

  const checkRestaurant = async () => {
    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch("/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const restaurant = await response.json();
        if (!restaurant) {
          setRestaurantSetupOpen(true);
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to check restaurant:", error);
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const hasRestaurant = await checkRestaurant();
      if (!hasRestaurant) return;

      const token = localStorage.getItem("adminAuth");
      const [menuResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/menu", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (menuResponse.ok && categoriesResponse.ok) {
        const menuData = await menuResponse.json();
        const categoriesData = await categoriesResponse.json();
        setMenuItems(menuData);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: Menu) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: Menu) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    try {
      const token = localStorage.getItem("adminAuth");
      const response = await fetch(`/api/admin/menu/${deletingItem.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchData();
        setDeleteDialogOpen(false);
        setDeletingItem(null);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setEditingItem(null);
    if (refresh) {
      fetchData();
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading menu items...</p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground">
                Manage your restaurant menu items and categories
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCategoryDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="outline">
                        ฿{Number(item.price).toFixed(0)}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {item.category.name}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMenuItems.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">
                  <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>No menu items found</p>
                  <p className="text-sm">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first menu item to get started"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialogs */}
        <MenuDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          categories={categories}
          editingItem={editingItem}
        />

        <CategoryDialog
          open={categoryDialogOpen}
          onClose={(refresh) => {
            setCategoryDialogOpen(false);
            if (refresh) fetchData();
          }}
        />

        <RestaurantSetupDialog
          open={restaurantSetupOpen}
          onClose={(created) => {
            setRestaurantSetupOpen(false);
            if (created) {
              fetchData();
            }
          }}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Menu Item"
          description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        />
      </AdminLayout>
    </AuthGuard>
  );
}
