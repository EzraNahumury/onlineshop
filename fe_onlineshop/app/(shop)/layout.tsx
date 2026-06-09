import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { getCurrentUser } from "@/lib/user-auth";

// Force dynamic — this layout reads cookies for auth state. Without this,
// Next.js may cache the rendered output across requests, which would make
// the user appear "logged out" on navigations that reuse the cached layout.
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <>
      <Header
        initialUser={
          user ? { id: user.id, name: user.name, email: user.email } : null
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
