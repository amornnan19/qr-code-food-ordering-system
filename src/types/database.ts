import type {
  Restaurant,
  Table,
  Category,
  Menu,
  Order,
  OrderItem,
  $Enums,
} from "../generated/prisma";

// Export OrderStatus from $Enums
export type OrderStatus = $Enums.OrderStatus;

// Base types from Prisma
export type {
  Restaurant,
  Table,
  Category,
  Menu,
  Order,
  OrderItem,
};

// Extended types with relations
export type RestaurantWithTables = Restaurant & {
  tables: Table[];
};

export type RestaurantWithCategories = Restaurant & {
  categories: Category[];
};

export type MenuWithCategory = Menu & {
  category: Category;
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    menu: Menu;
  })[];
  table: Table;
  restaurant: Restaurant;
};

export type CategoryWithMenus = Category & {
  menus: Menu[];
};

// Create/Update types
export type CreateRestaurantData = Omit<
  Restaurant,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateRestaurantData = Partial<CreateRestaurantData>;

export type CreateTableData = Omit<Table, "id">;
export type UpdateTableData = Partial<Omit<Table, "id" | "restaurantId">>;

export type CreateMenuData = Omit<Menu, "id" | "createdAt" | "updatedAt">;
export type UpdateMenuData = Partial<
  Omit<Menu, "id" | "restaurantId" | "createdAt" | "updatedAt">
>;

export type CreateOrderData = Omit<
  Order,
  "id" | "orderNumber" | "createdAt" | "updatedAt"
>;
export type CreateOrderItemData = Omit<OrderItem, "id">;
