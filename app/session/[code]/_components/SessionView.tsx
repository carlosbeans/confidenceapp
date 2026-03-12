"use client";

import { useState, useEffect } from "react";
import { useSession } from "./SessionProvider";
import { ParticipantAvatars } from "./ParticipantAvatars";
import { TopicList } from "./TopicList";
import { AddTopicForm } from "./AddTopicForm";
import { VotingPanel } from "./VotingPanel";
import { ResultsPanel } from "./ResultsPanel";
import { ActionItems } from "./ActionItems";
import type { TopicData } from "@/lib/types";

export function SessionView() {
  const { session, isHost, loading, error } = useSession();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const activeTopic =
    session?.topics.find((t) => t.id === selectedTopicId) ??
    session?.topics.find(
      (t) => t.status === "voting" || t.status === "revealed"
    ) ??
    null;

  useEffect(() => {
    if (!selectedTopicId && session?.topics.length) {
      const active = session.topics.find(
        (t) => t.status === "voting" || t.status === "revealed"
      );
      if (active) setSelectedTopicId(active.id);
    }
  }, [session?.topics, selectedTopicId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">{error || "Session not found"}</p>
          <a href="/" className="mt-4 inline-block text-accent hover:underline">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">{session.name}</h1>
            <SessionCode code={session.code} />
          </div>
          <a
            href="/"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Leave
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <ParticipantAvatars activeTopic={activeTopic} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Topics
              </h2>
              <span className="text-xs text-muted-foreground">
                {session.topics.length} topic{session.topics.length !== 1 ? "s" : ""}
              </span>
            </div>
            <AddTopicForm />
            <TopicList
              activeTopic={activeTopic}
              onSelectTopic={(t: TopicData) => setSelectedTopicId(t.id)}
            />
          </aside>

          <main className="min-w-0">
            {activeTopic ? (
              <TopicDetail topic={activeTopic} />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">
                  {session.topics.length === 0
                    ? isHost
                      ? "Add a topic to get started"
                      : "Waiting for the host to add topics..."
                    : "Select a topic to view details"}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function TopicDetail({ topic }: { topic: TopicData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{topic.title}</h2>
        {topic.description && (
          <p className="mt-1 text-muted-foreground">{topic.description}</p>
        )}
      </div>

      {topic.status === "pending" && (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">Waiting for voting to start...</p>
        </div>
      )}

      {topic.status === "voting" && <VotingPanel topic={topic} />}

      {(topic.status === "revealed" || topic.status === "closed") && (
        <>
          <ResultsPanel topic={topic} />
          <ActionItems topic={topic} />
        </>
      )}
    </div>
  );
}

function SessionCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/session/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground"
      title="Copy session link"
    >
      <span className="font-mono font-bold tracking-widest">{code}</span>
      <span className="text-xs">{copied ? "Copied!" : "Copy link"}</span>
    </button>
  );
}
