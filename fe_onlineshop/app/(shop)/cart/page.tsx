import { CartView } from "./cart-view";

export const metadata = {
  title: "Keranjang Belanja",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-light mb-8">Keranjang Belanja</h1>
      <CartView />
    </div>
  );
}
