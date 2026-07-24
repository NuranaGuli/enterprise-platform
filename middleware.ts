import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const middleware = async (request: NextRequest) => {
  const signingKey = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "cyberkey_gg_secret"
  );

  const sessionToken = request.cookies.get("gk_token")?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Access restricted — no valid session token present." },
      { status: 401 }
    );
  }

  try {
    await jwtVerify(sessionToken, signingKey);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Session token is expired or tampered — please sign in again." },
      { status: 401 }
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
