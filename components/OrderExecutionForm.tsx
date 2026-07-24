"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameProduct } from "@/lib/gameVault";
import { usePlayerSession } from "@/lib/contexts/PlayerSessionContext";

export default function OrderExecutionForm({ games }: { games: GameProduct[] }) {
  const router = useRouter();
  const session = usePlayerSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commitPurchaseOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);
    const form = e.currentTarget;

    const orderPayload = {
      gameId: (form.elements.namedItem("gameId") as HTMLSelectElement).value,
      unitCount: Number((form.elements.namedItem("unitCount") as HTMLInputElement).value),
      deliveryState: (form.elements.namedItem("deliveryState") as HTMLSelectElement).value,
      customerId: (form.elements.namedItem("customerId") as HTMLInputElement).value,
      grandTotal: Number((form.elements.namedItem("grandTotal") as HTMLInputElement).value),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSubmissionError(
          body?.error?.[0]?.message ?? body?.error ?? "Couldn't log that order — please try again.",
        );
        return;
      }

      setIsFormOpen(false);
      router.refresh();
    } catch {
      setSubmissionError("Network error — couldn't reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none";
  const inputStyle = {
    background: "var(--gk-void)",
    border: "1px solid var(--gk-border)",
  };

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          border: "1px solid var(--gk-accent)",
          color: "var(--gk-accent-glow)",
          background: "var(--gk-accent-dim)",
        }}
      >
        + Log Purchase Order
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🛒 Execute Purchase Order</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ color: "var(--gk-muted)" }}
                className="hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={commitPurchaseOrder} className="space-y-3">
              <select
                name="gameId"
                required
                defaultValue=""
                className={inputClass}
                style={{ ...inputStyle, color: games.length ? "#fff" : "#9ca3af" }}
              >
                <option value="" disabled>
                  {games.length ? "Select a game…" : "No games in the vault yet"}
                </option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title} — ${game.retailPrice.toFixed(2)}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="unitCount"
                  type="number"
                  placeholder="Unit count"
                  required
                  min={1}
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  name="grandTotal"
                  type="number"
                  step="0.01"
                  placeholder="Grand total ($)"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <select
                name="deliveryState"
                required
                defaultValue=""
                className={inputClass}
                style={{ ...inputStyle, color: "#9ca3af" }}
              >
                <option value="">Delivery state…</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="refunded">Refunded</option>
              </select>

              <input
                name="customerId"
                placeholder="Customer ID"
                required
                defaultValue={session?.currentPlayer?.accountId ?? ""}
                className={inputClass}
                style={inputStyle}
              />
              <p className="text-xs -mt-1" style={{ color: "var(--gk-muted)" }}>
                Defaults to your own account — replace with another player&apos;s ID if logging on their behalf.
              </p>

              {submissionError && (
                <p className="text-xs" style={{ color: "#f87171" }}>
                  {submissionError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ border: "1px solid var(--gk-border)", color: "var(--gk-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: "var(--gk-accent)" }}
                >
                  {isSubmitting ? "Committing…" : "Commit Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
