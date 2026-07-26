import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/auth/jwtSecret";

export const proxy = async (request: NextRequest) => {
  let signingKey: Uint8Array;
  try {
    signingKey = new TextEncoder().encode(getJwtSecret());
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration — JWT_SECRET is not set." },
      { status: 500 }
    );
  }

  const sessionToken = request.cookies.get("gk_token")?.value;

if (!sessionToken) {
  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}

  try {
    await jwtVerify(sessionToken, signingKey);
    return NextResponse.next();
  } catch {
  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}
};

export const config = {
  matcher: [
    "/api/vault/:path*",
    "/api/orders/:path*",
    "/api/allocation/:path*",
    "/dashboard",
  ],
};