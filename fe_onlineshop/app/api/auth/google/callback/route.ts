import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, hashPassword } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieState = req.cookies.get("oauth_state")?.value;

  function back(msg: string) {
    const r = new URL("/login", url.origin);
    r.searchParams.set("error", msg);
    return NextResponse.redirect(r);
  }

  if (error) return back(`Login Google dibatalkan: ${error}`);
  if (!code) return back("Kode otorisasi tidak ditemukan");
  if (!state || !cookieState || state !== cookieState) {
    return back("State OAuth tidak valid");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return back("Google OAuth belum dikonfigurasi");
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;

  let tokenData: { access_token?: string; id_token?: string };
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return back("Gagal menukar kode OAuth");
    }
  } catch {
    return back("Gagal menghubungi Google");
  }

  let profile: { email?: string; name?: string; sub?: string };
  try {
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    profile = await profileRes.json();
    if (!profile.email) return back("Email tidak tersedia dari Google");
  } catch {
    return back("Gagal mengambil profil Google");
  }

  const email = profile.email.toLowerCase();
  const name = profile.name || email.split("@")[0];

  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, is_active FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  let userId: number;
  if (existing.length > 0) {
    const u = existing[0];
    if (!u.is_active) return back("Akun nonaktif");
    userId = u.id;
    await db.query<ResultSetHeader>(
      "UPDATE users SET last_login_at = NOW(), email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?",
      [userId]
    );
  } else {
    const placeholderPassword = await hashPassword(
      crypto.randomBytes(24).toString("hex")
    );
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (name, email, password_hash, email_verified_at, last_login_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, email, placeholderPassword]
    );
    userId = result.insertId;
  }

  const token = signToken({ userId, email, role: "customer" });

  const response = NextResponse.redirect(new URL("/", url.origin));
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  response.cookies.delete("oauth_state");
  return response;
}
