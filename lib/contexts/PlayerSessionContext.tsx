"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  ReactNode,
} from "react";
import { terminateActiveSession } from "@/app/actions/authActions";

export interface PlayerProfile {
  accountId: string;
  playerEmail: string;
  accountTier: string;
}

interface PlayerSessionShape {
  currentPlayer: PlayerProfile | null;
  isLoadingSession: boolean;
  mountPlayerSession: (profile: PlayerProfile) => void;
  revokePlayerSession: () => Promise<void>;
  hydratePlayerSession: () => Promise<boolean>;
}

const PlayerSessionContext = createContext<PlayerSessionShape | null>(null);

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  const mountPlayerSession = (profile: PlayerProfile) => {
    setCurrentPlayer(profile);
  };

  const hydratePlayerSession = async (): Promise<boolean> => {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setCurrentPlayer(null);
      return false;
    }
    const data = (await response.json()) as {
      id: string;
      playerEmail: string;
      accountTier: string;
    };
    setCurrentPlayer({
      accountId: data.id,
      playerEmail: data.playerEmail,
      accountTier: data.accountTier,
    });
    return true;
  };

  const revokePlayerSession = async () => {
    startTransition(async () => {
      await terminateActiveSession();
      setCurrentPlayer(null);
    });
  };

  return (
    <PlayerSessionContext.Provider
      value={{
        currentPlayer,
        isLoadingSession: isPending,
        mountPlayerSession,
        hydratePlayerSession,
        revokePlayerSession,
      }}
    >
      {children}
    </PlayerSessionContext.Provider>
  );
}

export const usePlayerSession = () => useContext(PlayerSessionContext);
