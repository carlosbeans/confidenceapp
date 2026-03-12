"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SessionData, ParticipantData } from "@/lib/types";

interface SessionContextValue {
  session: SessionData | null;
  currentParticipant: ParticipantData | null;
  participantToken: string | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  currentParticipant: null,
  participantToken: null,
  isHost: false,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

interface SessionProviderProps {
  code: string;
  children: ReactNode;
}

function getTokenForSession(code: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const sessions = JSON.parse(localStorage.getItem("confidence-sessions") || "[]");
    const match = sessions.find((s: { code: string }) => s.code === code);
    return match?.token ?? null;
  } catch {
    return null;
  }
}

function getParticipantIdForSession(code: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const sessions = JSON.parse(localStorage.getItem("confidence-sessions") || "[]");
    const match = sessions.find((s: { code: string }) => s.code === code);
    return match?.participantId ?? null;
  } catch {
    return null;
  }
}

export function SessionProvider({ code, children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? getTokenForSession(code) : null;
  const participantId = typeof window !== "undefined" ? getParticipantIdForSession(code) : null;

  const fetchSession = useCallback(async () => {
    try {
      const url = token
        ? `/api/session/${code}?token=${encodeURIComponent(token)}`
        : `/api/session/${code}`;
      const res = await fetch(url);
      if (!res.ok) {
        setError("Session not found");
        return;
      }
      const data: SessionData = await res.json();
      setSession(data);
      setError(null);
    } catch {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [code, token]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 1500);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const currentParticipant =
    session?.participants.find((p) => p.id === participantId) ?? null;

  const isHost = currentParticipant?.isHost ?? false;

  return (
    <SessionContext.Provider
      value={{
        session,
        currentParticipant,
        participantToken: token,
        isHost,
        loading,
        error,
        refresh: fetchSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
