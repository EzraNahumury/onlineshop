import { create } from "zustand";

// In-memory only (no persist) — scoped to a single product detail page view.
// Lets VariantSelector tell ProductGallery which color is currently selected
// so the gallery can swap to the variant's image.
interface ProductViewState {
  productId: number | null;
  selectedColor: string;
  set: (productId: number, color: string) => void;
  reset: () => void;
}

export const useProductView = create<ProductViewState>((set) => ({
  productId: null,
  selectedColor: "",
  set: (productId, selectedColor) => set({ productId, selectedColor }),
  reset: () => set({ productId: null, selectedColor: "" }),
}));
