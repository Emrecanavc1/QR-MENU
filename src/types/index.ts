import {
  Tenant,
  User,
  Table,
  MenuCategory,
  MenuItem,
  ItemVariant,
  ItemExtra,
  Order,
  OrderItem,
  Payment,
  Location,
  UserRole,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus,
  PaymentProvider,
  TableStatus,
  SubscriptionPlan,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Tenant,
  User,
  Table,
  MenuCategory,
  MenuItem,
  ItemVariant,
  ItemExtra,
  Order,
  OrderItem,
  Payment,
  Location,
  UserRole,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus,
  PaymentProvider,
  TableStatus,
  SubscriptionPlan,
};

// Çok dilli tip
export interface MultiLang {
  tr: string;
  en?: string;
  [key: string]: string | undefined;
}

// Menü ürünü varyant seçeneği
export interface VariantOption {
  tr: string;
  en?: string;
  price: number;
}

// Sepet öğesi tipi (client-side)
export interface CartItem {
  menuItemId: string;
  name: MultiLang;
  price: number;
  imageUrl: string | null;
  quantity: number;
  selectedVariant?: {
    variantId: string;
    variantName: MultiLang;
    option: VariantOption;
  };
  selectedExtras?: {
    extraId: string;
    name: MultiLang;
    price: number;
  }[];
  notes?: string;
}

// API Yanıt tipi
export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Sipariş oluşturma isteği
export interface CreateOrderRequest {
  tableId: string;
  sessionToken: string;
  items: {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    variantId?: string;
    selectedVariant?: CartItem["selectedVariant"];
    selectedExtras?: CartItem["selectedExtras"];
    notes?: string;
  }[];
  notes?: string;
}

// Menü sayfası için zenginleştirilmiş tipler
export type MenuItemWithDetails = MenuItem & {
  variants: ItemVariant[];
  extras: ItemExtra[];
  category: MenuCategory;
};

export type MenuCategoryWithItems = MenuCategory & {
  menuItems: MenuItemWithDetails[];
};

// Sipariş takip için
export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    item: MenuItem;
  })[];
  table: Table;
};

// Dashboard istatistik tipi
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeTables: number;
  totalTables: number;
  topItems: {
    itemId: string;
    name: MultiLang;
    count: number;
    revenue: number;
  }[];
}

// WebSocket olay tipleri
export type WSEventType =
  | "NEW_ORDER"
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_COMPLETED"
  | "TABLE_OPENED"
  | "STOCK_DEPLETED";

export interface WSEvent<T = unknown> {
  type: WSEventType;
  tenantId: string;
  payload: T;
  timestamp: string;
}
