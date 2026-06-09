import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { AccountSidebar } from "@/components/shop/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/profile");
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <AccountSidebar userName={user.name} userEmail={user.email} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
