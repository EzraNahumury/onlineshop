import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: number;
  variantId: number | null;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  updateQuantity: (
    productId: number,
    variantId: number | null,
    qty: number
  ) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (idx >= 0) {
            const items = [...s.items];
            const next = items[idx].quantity + item.quantity;
            items[idx] = {
              ...items[idx],
              quantity: Math.min(item.maxStock, next),
            };
            return { items };
          }
          return { items: [...s.items, item] };
        }),
      removeItem: (pid, vid) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === pid && i.variantId === vid)
          ),
        })),
      updateQuantity: (pid, vid, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === pid && i.variantId === vid
              ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, qty)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ayres-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function selectCartCount(s: CartState): number {
  return s.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function selectCartTotal(s: CartState): number {
  return s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}
