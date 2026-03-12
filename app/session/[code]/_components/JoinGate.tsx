"use client";

import { useState } from "react";
import { joinSession } from "@/lib/actions";

interface JoinGateProps {
  code: string;
  onJoined: () => void;
}

function getSavedSessions() {
  try {
    return JSON.parse(localStorage.getItem("confidence-sessions") || "[]");
  } catch {
    return [];
  }
}

export function JoinGate({ code, onJoined }: JoinGateProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await joinSession(code, name.trim());
      if ("error" in result) {
        setError(result.error!);
        setLoading(false);
        return;
      }
      const sessions = getSavedSessions().filter(
        (s: { code: string }) => s.code !== code
      );
      sessions.unshift({
        code: result.code,
        name: "",
        participantName: name.trim(),
        token: result.token,
        participantId: result.participantId,
        joinedAt: new Date().toISOString(),
      });
      localStorage.setItem("confidence-sessions", JSON.stringify(sessions));
      onJoined();
    } catch {
      setError("Failed to join. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Join Session</h1>
          <p className="mt-1 text-muted-foreground">
            Enter your name to join session <span className="font-mono font-bold">{code}</span>
          </p>
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            autoFocus
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
