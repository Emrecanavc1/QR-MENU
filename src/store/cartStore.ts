import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  tenantSlug: string | null;
  tableNo: string | null;
  sessionToken: string | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string, variantId?: string) => void;
  updateQuantity: (menuItemId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setSession: (tenantSlug: string, tableNo: string, sessionToken: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tenantSlug: null,
      tableNo: null,
      sessionToken: null,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.menuItemId === newItem.menuItemId &&
              item.selectedVariant?.variantId === newItem.selectedVariant?.variantId
          );

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (menuItemId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.menuItemId === menuItemId &&
                item.selectedVariant?.variantId === variantId
              )
          ),
        }));
      },

      updateQuantity: (menuItemId, quantity, variantId) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(
                    item.menuItemId === menuItemId &&
                    item.selectedVariant?.variantId === variantId
                  )
              ),
            };
          }
          return {
            items: state.items.map((item) =>
              item.menuItemId === menuItemId &&
              item.selectedVariant?.variantId === variantId
                ? { ...item, quantity }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      setSession: (tenantSlug, tableNo, sessionToken) =>
        set({ tenantSlug, tableNo, sessionToken }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const extrasTotal = item.selectedExtras
            ? item.selectedExtras.reduce((s, e) => s + e.price, 0)
            : 0;
          const variantPrice = item.selectedVariant?.option.price ?? 0;
          return total + (item.price + variantPrice + extrasTotal) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "qr-menu-cart",
      partialize: (state) => ({
        items: state.items,
        tenantSlug: state.tenantSlug,
        tableNo: state.tableNo,
        sessionToken: state.sessionToken,
      }),
    }
  )
);
