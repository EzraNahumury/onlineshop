import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";
import { RowDataPacket } from "mysql2";
import { ProfileCard } from "./profile-card";
import { PasswordCard } from "./password-card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null; // layout handles redirect

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, name, email, phone, email_verified_at FROM users WHERE id = ? LIMIT 1`,
    [user.id]
  );
  const profile = rows[0];

  const [addrRows] = await db.query<RowDataPacket[]>(
    `SELECT address_line, district, city, province, postal_code
       FROM user_addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, id DESC
      LIMIT 1`,
    [user.id]
  );
  const defaultAddress = addrRows[0]
    ? [
        addrRows[0].address_line,
        addrRows[0].district,
        addrRows[0].city,
        addrRows[0].province,
        addrRows[0].postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-black">Profil</h1>

      <ProfileCard
        name={profile.name}
        email={profile.email}
        phone={profile.phone}
        emailVerified={!!profile.email_verified_at}
        address={defaultAddress}
      />

      <PasswordCard />
    </div>
  );
}
