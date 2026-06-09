import { listAdmins, listAdminRoles } from "@/lib/queries/admins";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { RolesView, type AdminItem, type RoleItem } from "./roles-view";

export const dynamic = "force-dynamic";

export default async function MasterRolesPage() {
  const [me, admins, roles] = await Promise.all([
    getCurrentAdmin(),
    listAdmins(),
    listAdminRoles(),
  ]);

  const items: AdminItem[] = admins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role_id: a.role_id,
    role_name: a.role_name,
    is_active: a.is_active === 1,
    last_login_at: a.last_login_at ? new Date(a.last_login_at).toISOString() : null,
  }));

  const roleItems: RoleItem[] = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Role & Akun Admin"
        description="Kelola akun yang bisa mengakses panel admin beserta rolenya"
      />
      <RolesView admins={items} roles={roleItems} currentAdminId={me?.id ?? 0} />
    </div>
  );
}
