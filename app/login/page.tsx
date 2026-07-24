"use client";

import { usePlayerSession } from "@/lib/contexts/PlayerSessionContext";
import { executePlayerSignIn } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition, useState } from "react";

export default function SignInPage() {
  const session = usePlayerSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);

  if (!session) return null;

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const outcome = await executePlayerSignIn(formData);

      if (!outcome.authenticated) {
        setAuthError(
          outcome.violations?.[0] ?? "Sign-in could not be completed. Please try again."
        );
        return;
      }

      session.mountPlayerSession({
        accountId: outcome.accountId,
        playerEmail: outcome.playerEmail,
        accountTier: outcome.accountTier,
      });

      router.push("/dashboard");
    });
  };

  const inputStyle = {
    background: "var(--gk-void)",
    border: "1px solid var(--gk-border)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #09090f 0%, #12082a 50%, #09090f 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gk-accent)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 12h4m-2-2v4M15 11h.01M18 11h.01M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="text-3xl font-black text-white tracking-tight">
              Cyber<span style={{ color: "var(--gk-accent-glow)" }}>Key</span>
            </span>
          </div>
          <p style={{ color: "var(--gk-muted)" }} className="text-sm">
            Digital Game Keys · Instant Delivery
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
        >
          <h1 className="text-xl font-bold text-white mb-6">Welcome back, Player</h1>

          {authError && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--gk-muted)" }}
              >
                Player Email
              </label>
              <input
                name="playerEmail"
                type="email"
                placeholder="player@cyberkey.gg"
                required
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--gk-muted)" }}
              >
                Security Key
              </label>
              <input
                name="securityKey"
                type="password"
                placeholder="Min. 8 characters"
                required
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-lg font-bold text-white text-sm mt-2 transition-all"
              style={{
                background: isPending ? "var(--gk-accent-dim)" : "var(--gk-accent)",
                boxShadow: isPending ? "none" : "0 0 20px rgba(124,58,237,0.4)",
              }}
            >
              {isPending ? "Authenticating…" : "🎮 Enter Store"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--gk-muted)" }}>
            New to CyberKey?{" "}
            <Link
              href="/register"
              className="font-semibold"
              style={{ color: "var(--gk-accent-glow)" }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
