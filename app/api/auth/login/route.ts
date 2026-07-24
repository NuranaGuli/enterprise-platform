import { getPlayerByEmail } from "@/lib/gameVault";
import { PlayerSignInSchema } from "@/lib/validations/authSchemas";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const POST = async (request: Request) => {
  const requestBody = await request.json();

  const schemaResult = PlayerSignInSchema.safeParse(requestBody);
  if (!schemaResult.success) {
    return NextResponse.json(
      { error: schemaResult.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { playerEmail, securityKey } = schemaResult.data;

  const resolvedAccount = await getPlayerByEmail(playerEmail);
  if (!resolvedAccount) {
    return NextResponse.json(
      { error: "No player account found for the given email address." },
      { status: 404 }
    );
  }

  const keyMatches = await bcrypt.compare(securityKey, resolvedAccount.hashedSecurityKey);
  if (!keyMatches) {
    return NextResponse.json(
      { error: "Authentication failed — the supplied credentials do not match our records." },
      { status: 401 }
    );
  }

  const sessionToken = jwt.sign(
    { accountId: resolvedAccount.id },
    process.env.JWT_SECRET ?? "cyberkey_gg_secret",
    { expiresIn: "7d" }
  );

  const serverResponse = NextResponse.json({ sessionEstablished: true });
  serverResponse.cookies.set("gk_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return serverResponse;
};
