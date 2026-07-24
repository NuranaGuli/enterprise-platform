"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalNav from "@/components/GlobalNav";
import LicenseIngestionPanel from "@/components/LicenseIngestionPanel";
import OrderExecutionForm from "@/components/OrderExecutionForm";
import { GameProduct, PurchaseOrder } from "@/lib/gameVault";
import { useQuery } from "@tanstack/react-query";
import { usePlayerSession } from "@/lib/contexts/PlayerSessionContext";

const platformBadgeStyle: Record<string, { bg: string; color: string }> = {
  steam:   { bg: "rgba(102,192,244,0.15)", color: "#66c0f4" },
  epic:    { bg: "rgba(255,255,255,0.08)", color: "#e0e0e0" },
  psn:     { bg: "rgba(0,100,220,0.2)",   color: "#4499ff" },
  xbox:    { bg: "rgba(16,124,16,0.2)",   color: "#57e557" },
  gog:     { bg: "rgba(165,90,220,0.2)",  color: "#c87dff" },
  ubisoft: { bg: "rgba(59,130,246,0.2)",  color: "#93c5fd" },
};

const deliveryStateStyle: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  processing: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  fulfilled:  { bg: "rgba(34,197,94,0.15)",  color: "#4ade80" },
  refunded:   { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
};

const genreEmoji: Record<string, string> = {
  rpg: "⚔️", fps: "🔫", "action-rpg": "🗡️", strategy: "♟️",
  sports: "⚽", simulation: "🚗", horror: "👻", indie: "🎨",
};

export default function AdminDashboard() {
  const session = usePlayerSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    if (!session.currentPlayer && !session.isLoadingSession) {
      session.hydratePlayerSession().then((success) => {
        if (!success) {
          router.push("/login");
        }
      });
    }
  }, []);

  const { data: vaultEntries, isLoading: vaultLoading } = useQuery<GameProduct[]>({
    queryKey: ["vault"],
    queryFn: () => fetch("/api/vault").then((r) => r.json()),
    refetchInterval: 8000,
  });

  const { data: orderLog, isLoading: ordersLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/orders").then((r) => r.json()),
    refetchInterval: 8000,
  });

  const totalRevenue = orderLog?.reduce((acc, o) => acc + o.grandTotal, 0) ?? 0;
  const pendingCount = orderLog?.filter((o) => o.deliveryState === "pending").length ?? 0;
  const totalTitles  = vaultEntries?.length ?? 0;
  const totalStock   = vaultEntries?.reduce((acc, g) => acc + g.availableKeys, 0) ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--gk-void)" }}>
      <GlobalNav />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">🎮 Game Vault Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gk-muted)" }}>
              Manage digital game listings, purchase orders, and key allocation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrderExecutionForm games={vaultEntries ?? []} />
            <LicenseIngestionPanel />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Revenue",  value: `$${totalRevenue.toFixed(2)}`, color: "#9f67ff", icon: "💰" },
            { label: "Active Titles",  value: totalTitles,                   color: "#fff",     icon: "🎮" },
            { label: "Keys in Stock",  value: totalStock,                    color: "#4ade80",  icon: "🔑" },
            { label: "Pending Orders", value: pendingCount,                  color: "#fbbf24",  icon: "⏳" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5"
              style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--gk-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Game Vault Grid */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">🗄️ Vault — Game Listings</h2>

          {vaultLoading ? (
            <div className="text-center py-12" style={{ color: "var(--gk-muted)" }}>
              Loading vault…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaultEntries?.map((game: GameProduct) => {
                const pBadge = platformBadgeStyle[game.platform] ?? {
                  bg: "rgba(255,255,255,0.08)",
                  color: "#ccc",
                };
                return (
                  <div
                    key={game.id}
                    className="rounded-xl p-5 transition-all cursor-default"
                    style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{genreEmoji[game.genre] ?? "🎮"}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md uppercase"
                        style={{ background: pBadge.bg, color: pBadge.color }}
                      >
                        {game.platform}
                      </span>
                    </div>

                    <p className="font-bold text-white text-sm leading-snug mb-1">{game.title}</p>
                    <p className="text-xs mb-3" style={{ color: "var(--gk-muted)" }}>
                      {game.publisher} · {game.ageRating}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black" style={{ color: "var(--gk-accent-glow)" }}>
                        ${game.retailPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium" style={{ color: "var(--gk-muted)" }}>
                        {game.availableKeys} keys left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Orders Table */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">📋 Purchase Order Log</h2>

          {ordersLoading ? (
            <div className="text-center py-12" style={{ color: "var(--gk-muted)" }}>
              Loading orders…
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gk-border)" }}>
                    {["Order ID", "Game", "Units", "Total", "State", "Customer"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--gk-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderLog?.map((order: PurchaseOrder) => {
                    const ds = deliveryStateStyle[order.deliveryState] ?? {
                      bg: "rgba(255,255,255,0.08)",
                      color: "#ccc",
                    };
                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid rgba(42,42,61,0.6)" }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gk-muted)" }}>
                          {order.id}
                        </td>
                        <td className="px-5 py-3 text-white font-medium">{order.gameId}</td>
                        <td className="px-5 py-3" style={{ color: "var(--gk-muted)" }}>
                          {order.unitCount}
                        </td>
                        <td className="px-5 py-3 font-bold" style={{ color: "var(--gk-accent-glow)" }}>
                          ${order.grandTotal.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-md capitalize"
                            style={{ background: ds.bg, color: ds.color }}
                          >
                            {order.deliveryState}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--gk-muted)" }}>
                          {order.customerId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(!orderLog || orderLog.length === 0) && (
                <div className="text-center py-12" style={{ color: "var(--gk-muted)" }}>
                  No purchase orders have been recorded yet.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
