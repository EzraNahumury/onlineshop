import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const url = new URL(req.url);
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set(
      "error",
      "Google sign-in belum dikonfigurasi. Set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET di .env."
    );
    return NextResponse.redirect(redirect);
  }

  const origin = new URL(req.url).origin;
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
