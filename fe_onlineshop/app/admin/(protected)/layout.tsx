import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import AdminLogoutButton from "./logout-button";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <AdminSidebar
        adminName={admin.name}
        adminRole={admin.role_name || "admin"}
        logoutSlot={<AdminLogoutButton />}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
