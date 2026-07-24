"use client";

import { dispatchGameListing } from "@/app/actions/vaultManager";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LicenseIngestionPanel() {
  const router = useRouter();
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const handleListingSubmission = async (formData: FormData) => {
    const outcome = await dispatchGameListing(formData);
    if (outcome?.committed) {
      setIsPanelVisible(false);
      router.refresh();
    }
  };

  const inputClass =
    "w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1";
  const inputStyle = {
    background: "var(--gk-void)",
    border: "1px solid var(--gk-border)",
  };

  return (
    <>
      <button
        onClick={() => setIsPanelVisible(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
        style={{ background: "var(--gk-accent)", boxShadow: "0 0 16px rgba(124,58,237,0.35)" }}
      >
        <span>+</span> Add Game Listing
      </button>

      {isPanelVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: "var(--gk-panel)", border: "1px solid var(--gk-border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">📦 Ingest Game Listing</h2>
              <button
                onClick={() => setIsPanelVisible(false)}
                style={{ color: "var(--gk-muted)" }}
                className="hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <form action={handleListingSubmission} className="space-y-3">
              <input
                name="title"
                placeholder="Game title (e.g. Elden Ring GOTY Edition)"
                required
                className={inputClass}
                style={inputStyle}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="retailPrice"
                  type="number"
                  step="0.01"
                  placeholder="Retail price ($)"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  name="availableKeys"
                  type="number"
                  placeholder="Key stock count"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="genre"
                  required
                  className={inputClass}
                  style={{ ...inputStyle, color: "#9ca3af" }}
                >
                  <option value="">Genre…</option>
                  <option value="rpg">RPG</option>
                  <option value="fps">FPS</option>
                  <option value="action-rpg">Action RPG</option>
                  <option value="strategy">Strategy</option>
                  <option value="sports">Sports</option>
                  <option value="simulation">Simulation</option>
                  <option value="horror">Horror</option>
                  <option value="indie">Indie</option>
                </select>

                <select
                  name="platform"
                  required
                  className={inputClass}
                  style={{ ...inputStyle, color: "#9ca3af" }}
                >
                  <option value="">Platform…</option>
                  <option value="steam">Steam</option>
                  <option value="epic">Epic Games</option>
                  <option value="psn">PlayStation Network</option>
                  <option value="xbox">Xbox / Microsoft Store</option>
                  <option value="gog">GOG</option>
                  <option value="ubisoft">Ubisoft Connect</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="ageRating"
                  required
                  className={inputClass}
                  style={{ ...inputStyle, color: "#9ca3af" }}
                >
                  <option value="">Age rating…</option>
                  <option value="PEGI 3">PEGI 3</option>
                  <option value="PEGI 7">PEGI 7</option>
                  <option value="PEGI 12">PEGI 12</option>
                  <option value="PEGI 16">PEGI 16</option>
                  <option value="PEGI 18">PEGI 18</option>
                </select>

                <input
                  name="publisher"
                  placeholder="Publisher name"
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPanelVisible(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: "1px solid var(--gk-border)", color: "var(--gk-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
                  style={{ background: "var(--gk-accent)" }}
                >
                  Ingest Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
