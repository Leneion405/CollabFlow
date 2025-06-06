import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/appwrite";
import { AUTH_COOKIE } from "@/features/auth/constants";

// This route handles the OAuth callback from Google
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const { account } = await createAdminClient();
  const session = await account.createSession(userId, secret);

  // Set the session cookie so Hono and Next.js both recognize it
  cookies().set(AUTH_COOKIE, session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax", // "lax" is compatible with OAuth redirects
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Redirect to dashboard with a flag for post-OAuth logic
  return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?oauth=success`);
}
