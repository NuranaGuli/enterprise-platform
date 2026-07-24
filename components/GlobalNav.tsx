"use client";

import { usePlayerSession } from "@/lib/contexts/PlayerSessionContext";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function GlobalNav() {
  const session = usePlayerSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await session?.revokePlayerSession();
      router.push("/login");
    });
  };

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ background: "var(--gk-surface)", borderColor: "var(--gk-border)" }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--gk-accent)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M6 12h4m-2-2v4M15 11h.01M18 11h.01M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2z" />
          </svg>
        </div>
        <span className="font-black text-white text-lg tracking-tight">
          Cyber<span style={{ color: "var(--gk-accent-glow)" }}>Key</span>
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{ background: "var(--gk-accent-dim)", color: "var(--gk-accent-glow)" }}
        >
          {session?.currentPlayer?.accountTier?.toUpperCase() ?? "GUEST"}
        </span>
      </div>

      {/* Right: Player email + Sign Out */}
      <div className="flex items-center gap-4">
        {session?.currentPlayer && (
          <span className="text-sm" style={{ color: "var(--gk-muted)" }}>
            {session.currentPlayer.playerEmail}
          </span>
        )}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          style={{ border: "1px solid var(--gk-border)", color: "var(--gk-muted)" }}
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
