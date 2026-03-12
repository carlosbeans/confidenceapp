"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSession, joinSession } from "@/lib/actions";

interface SavedSession {
  code: string;
  name: string;
  participantName: string;
  token: string;
  participantId: string;
  joinedAt: string;
}

function getSavedSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("confidence-sessions") || "[]");
  } catch {
    return [];
  }
}

function saveSession(session: SavedSession) {
  const sessions = getSavedSessions().filter((s) => s.code !== session.code);
  sessions.unshift(session);
  localStorage.setItem("confidence-sessions", JSON.stringify(sessions));
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [hostName, setHostName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setPastSessions(getSavedSessions());
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!hostName.trim() || !sessionName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await createSession(hostName.trim(), sessionName.trim());
      saveSession({
        code: result.code,
        name: sessionName.trim(),
        participantName: hostName.trim(),
        token: result.token,
        participantId: result.participantId,
        joinedAt: new Date().toISOString(),
      });
      router.push(`/session/${result.code}`);
    } catch {
      setError("Failed to create session. Please try again.");
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await joinSession(joinCode.trim().toUpperCase(), joinName.trim());
      if ("error" in result) {
        setError(result.error!);
        setLoading(false);
        return;
      }
      saveSession({
        code: result.code!,
        name: "",
        participantName: joinName.trim(),
        token: result.token!,
        participantId: result.participantId!,
        joinedAt: new Date().toISOString(),
      });
      router.push(`/session/${result.code}`);
    } catch {
      setError("Failed to join session. Please try again.");
      setLoading(false);
    }
  }

  function handleRejoin(session: SavedSession) {
    router.push(`/session/${session.code}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-8 w-2 rounded-full ${
                    n === 1
                      ? "bg-red-500"
                      : n === 2
                      ? "bg-orange-500"
                      : n === 3
                      ? "bg-yellow-500"
                      : n === 4
                      ? "bg-lime-500"
                      : "bg-green-500"
                  }`}
                  style={{ height: `${12 + n * 6}px` }}
                />
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Confidence Check</h1>
          <p className="mt-2 text-muted-foreground">
            Align your team on how confident you are about an idea
          </p>
        </div>

        {mode === "idle" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Create a Session
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full rounded-xl border border-border bg-card px-6 py-4 text-lg font-semibold text-card-foreground transition-all hover:bg-muted active:scale-[0.98]"
            >
              Join a Session
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="hostName" className="mb-1.5 block text-sm font-medium">
                Your name
              </label>
              <input
                id="hostName"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="sessionName" className="mb-1.5 block text-sm font-medium">
                Session name
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. Q2 Roadmap Alignment"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMode("idle"); setError(""); }}
                className="flex-1 rounded-lg border border-border px-4 py-3 font-medium transition-colors hover:bg-muted"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="joinName" className="mb-1.5 block text-sm font-medium">
                Your name
              </label>
              <input
                id="joinName"
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="e.g. Jordan"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="joinCode" className="mb-1.5 block text-sm font-medium">
                Session code
              </label>
              <input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-lg tracking-widest text-card-foreground placeholder:text-muted-foreground placeholder:tracking-normal placeholder:font-sans placeholder:text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setMode("idle"); setError(""); }}
                className="flex-1 rounded-lg border border-border px-4 py-3 font-medium transition-colors hover:bg-muted"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        )}

        {pastSessions.length > 0 && mode === "idle" && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent Sessions</h2>
            <div className="space-y-2">
              {pastSessions.slice(0, 5).map((s) => (
                <button
                  key={s.code}
                  onClick={() => handleRejoin(s)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="font-medium text-card-foreground">
                      {s.name || `Session ${s.code}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined as {s.participantName}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">{s.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
