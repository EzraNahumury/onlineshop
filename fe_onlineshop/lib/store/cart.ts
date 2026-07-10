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
  // Absent on carts persisted before this field existed — treat as selected.
  selected?: boolean;
}

interface ItemKey {
  productId: number;
  variantId: number | null;
}

export function isCartItemSelected(item: CartItem): boolean {
  return item.selected !== false;
}

function sameItem(item: CartItem, key: ItemKey): boolean {
  return item.productId === key.productId && item.variantId === key.variantId;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  removeItems: (keys: ItemKey[]) => void;
  updateQuantity: (
    productId: number,
    variantId: number | null,
    qty: number
  ) => void;
  toggleSelected: (productId: number, variantId: number | null) => void;
  setAllSelected: (selected: boolean) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => sameItem(i, item));
          if (idx >= 0) {
            const items = [...s.items];
            const next = items[idx].quantity + item.quantity;
            items[idx] = {
              ...items[idx],
              quantity: Math.min(item.maxStock, next),
            };
            return { items };
          }
          return { items: [...s.items, { ...item, selected: true }] };
        }),
      removeItem: (pid, vid) =>
        set((s) => ({
          items: s.items.filter((i) => !sameItem(i, { productId: pid, variantId: vid })),
        })),
      removeItems: (keys) =>
        set((s) => ({
          items: s.items.filter((i) => !keys.some((k) => sameItem(i, k))),
        })),
      updateQuantity: (pid, vid, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            sameItem(i, { productId: pid, variantId: vid })
              ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, qty)) }
              : i
          ),
        })),
      toggleSelected: (pid, vid) =>
        set((s) => ({
          items: s.items.map((i) =>
            sameItem(i, { productId: pid, variantId: vid })
              ? { ...i, selected: !isCartItemSelected(i) }
              : i
          ),
        })),
      setAllSelected: (selected) =>
        set((s) => ({
          items: s.items.map((i) => ({ ...i, selected })),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ayres-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Total item count in the cart, regardless of selection — used by the header badge.
export function selectCartCount(s: CartState): number {
  return s.items.reduce((sum, i) => sum + i.quantity, 0);
}

// Total value of the whole cart, regardless of selection.
export function selectCartTotal(s: CartState): number {
  return s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

// NOTE: intentionally no `selectSelectedItems` selector here — a selector that
// returns a freshly `.filter()`-ed array is a new reference on every call, and
// zustand v5's plain `useStore` (backed by `useSyncExternalStore`, no built-in
// result memoization) treats that as "state changed" on every render, causing
// an infinite re-render loop (React error #185). Components needing the
// filtered list must select the raw `items` array (stable reference) and
// derive the filtered list with `useMemo`, e.g.:
//   const items = useCart((s) => s.items);
//   const selected = useMemo(() => items.filter(isCartItemSelected), [items]);

export function selectSelectedCount(s: CartState): number {
  return s.items.reduce((sum, i) => (isCartItemSelected(i) ? sum + i.quantity : sum), 0);
}

export function selectSelectedTotal(s: CartState): number {
  return s.items.reduce(
    (sum, i) => (isCartItemSelected(i) ? sum + i.unitPrice * i.quantity : sum),
    0
  );
}

export function selectAllSelected(s: CartState): boolean {
  return s.items.length > 0 && s.items.every(isCartItemSelected);
}
