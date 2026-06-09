"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Minus, Plus, Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useT } from "@/lib/i18n";
import { useProductView } from "@/lib/store/product-view";

interface Variant {
  id: number;
  color: string;
  size: string;
  price: number;
  stock: number;
  image_url?: string | null;
}

interface VariantSelectorProps {
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string | null;
  basePrice: number;
  originalPrice?: number | null;
  hasVariant: boolean;
  variants: Variant[];
  colorOptions: string[];
  sizeOptions: string[];
  stock: number;
  minPurchase: number;
  maxPurchase: number | null;
}

export function VariantSelector({
  productId,
  productSlug,
  productName,
  productImage,
  basePrice,
  hasVariant,
  variants,
  colorOptions,
  sizeOptions,
  stock: productStock,
  minPurchase,
  maxPurchase,
}: VariantSelectorProps) {
  const router = useRouter();
  const { t } = useT();
  const addItem = useCart((s) => s.addItem);
  const setProductView = useProductView((s) => s.set);
  const resetProductView = useProductView((s) => s.reset);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(minPurchase);
  const [addedToCart, setAddedToCart] = useState(false);

  // Broadcast color selection to the gallery (which reads from useProductView)
  // so it can swap to the matching variant image.
  useEffect(() => {
    setProductView(productId, selectedColor);
    return () => resetProductView();
  }, [productId, selectedColor, setProductView, resetProductView]);

  const selectedVariant = hasVariant
    ? variants.find((v) => v.color === selectedColor && v.size === selectedSize)
    : null;

  const currentPrice = selectedVariant ? selectedVariant.price : basePrice;
  const currentStock = hasVariant ? selectedVariant?.stock ?? 0 : productStock;
  const maxQty = maxPurchase ? Math.min(maxPurchase, currentStock) : currentStock;
  const canAddToCart = hasVariant
    ? !!selectedVariant && currentStock > 0
    : currentStock > 0;

  function isSizeAvailable(size: string): boolean {
    if (!selectedColor) return variants.some((v) => v.size === size && v.stock > 0);
    return variants.some(
      (v) => v.color === selectedColor && v.size === size && v.stock > 0
    );
  }

  function buildVariantLabel(): string | null {
    if (!hasVariant) return null;
    const parts = [selectedColor, selectedSize].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : null;
  }

  function handleAddToCart() {
    if (!canAddToCart) return;
    addItem({
      productId,
      variantId: selectedVariant?.id ?? null,
      productSlug,
      productName,
      variantLabel: buildVariantLabel(),
      imageUrl: productImage,
      unitPrice: currentPrice,
      quantity,
      maxStock: currentStock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    if (!canAddToCart) return;
    handleAddToCart();
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-6">
      {colorOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t("product.color")}</span>
            {selectedColor && (
              <span className="text-sm text-neutral-500">{selectedColor}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize("");
                  setQuantity(minPurchase);
                }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                  selectedColor === color
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t("product.size")}</span>
            {selectedSize && (
              <span className="text-sm text-neutral-500">{selectedSize}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => {
                    if (available) {
                      setSelectedSize(size);
                      setQuantity(minPurchase);
                    }
                  }}
                  disabled={!available}
                  className={cn(
                    "w-14 h-11 rounded-lg text-sm font-medium border transition-all",
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : available
                        ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {canAddToCart && currentStock <= 10 && currentStock > 0 && (
        <p className="text-xs text-amber-600 font-medium">
          {t("product.onlyLeft", { n: currentStock })}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("product.quantity")}</span>
        <div className="flex items-center rounded-full border border-neutral-200">
          <button
            onClick={() => setQuantity(Math.max(minPurchase, quantity - 1))}
            disabled={quantity <= minPurchase}
            className="w-10 h-10 flex items-center justify-center rounded-l-full text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className="w-10 h-10 flex items-center justify-center rounded-r-full text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-neutral-100 pt-4">
        <span className="text-sm text-neutral-500">Subtotal</span>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums">
            {formatPrice(currentPrice * quantity)}
          </span>
          {quantity > 1 && (
            <div className="text-xs text-neutral-400">
              {formatPrice(currentPrice)} / item
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          variant={addedToCart ? "secondary" : "primary"}
          size="lg"
          className="w-full tracking-wide"
        >
          {addedToCart ? (
            <Check className="h-4 w-4" />
          ) : !hasVariant || (selectedColor && selectedSize) ? (
            <ShoppingBag className="h-4 w-4" />
          ) : null}
          {addedToCart
            ? "Added to Cart"
            : hasVariant && (!selectedColor || !selectedSize)
              ? "Select Options"
              : "Add to Cart"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full tracking-wide"
          disabled={!canAddToCart}
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
