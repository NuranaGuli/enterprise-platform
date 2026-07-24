"use server";

import {
  PlayerRegistrationSchema,
  PlayerSignInSchema,
} from "@/lib/validations/authSchemas";
import { getPlayerByEmail, createPlayerAccount } from "@/lib/gameVault";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type RegistrationResult =
  | { registered: true }
  | { registered: false; violations: string[] };

type SignInResult =
  | {
      authenticated: true;
      accountId: string;
      playerEmail: string;
      accountTier: string;
    }
  | { authenticated: false; violations: string[] };

type SessionTerminationResult = { terminated: true };


export const executePlayerRegistration = async (
  formData: FormData
): Promise<RegistrationResult> => {
  const rawInput = Object.fromEntries(formData.entries());
  const validatedFields = PlayerRegistrationSchema.safeParse(rawInput);

  if (!validatedFields.success) {
    return {
      registered: false,
      violations: validatedFields.error.issues.map((e) => e.message),
    };
  }

  const { playerEmail, securityKey } = validatedFields.data;

  const accountConflict = await getPlayerByEmail(playerEmail);

  if (accountConflict) {
    return {
      registered: false,
      violations: ["This email address is already linked to an existing account."],
    };
  }

  const hashedSecurityKey = await bcrypt.hash(securityKey, 10);

  await createPlayerAccount({
    playerEmail,
    hashedSecurityKey,
    accountTier: "player",
  });

  return { registered: true };
};


export const executePlayerSignIn = async (
  formData: FormData
): Promise<SignInResult> => {
  const rawInput = Object.fromEntries(formData.entries());
  const validatedFields = PlayerSignInSchema.safeParse(rawInput);

  if (!validatedFields.success) {
    return {
      authenticated: false,
      violations: validatedFields.error.issues.map((e) => e.message),
    };
  }

  const { playerEmail, securityKey } = validatedFields.data;

  const resolvedAccount = await getPlayerByEmail(playerEmail);

  if (!resolvedAccount) {
    return {
      authenticated: false,
      violations: ["No account found matching the provided email address."],
    };
  }

  const keyMatches = await bcrypt.compare(
    securityKey,
    resolvedAccount.hashedSecurityKey
  );

  if (!keyMatches) {
    return {
      authenticated: false,
      violations: [
        "Authentication failed — the supplied credentials do not match our records.",
      ],
    };
  }

  const sessionToken = jwt.sign(
    { accountId: resolvedAccount.id },
    process.env.JWT_SECRET ?? "cyberkey_gg_secret",
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("gk_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    authenticated: true,
    accountId: resolvedAccount.id,
    playerEmail: resolvedAccount.playerEmail,
    accountTier: resolvedAccount.accountTier,
  };
};


export const terminateActiveSession =
  async (): Promise<SessionTerminationResult> => {
    const cookieStore = await cookies();
    cookieStore.delete("gk_token");
    return { terminated: true };
  };
