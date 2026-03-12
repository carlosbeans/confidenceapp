"use client";

import { useSession } from "./SessionProvider";
import { startVoting } from "@/lib/actions";
import type { TopicData } from "@/lib/types";

interface TopicListProps {
  activeTopic: TopicData | null;
  onSelectTopic: (topic: TopicData) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  voting: "Voting",
  revealed: "Revealed",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  voting: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  revealed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  closed: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export function TopicList({ activeTopic, onSelectTopic }: TopicListProps) {
  const { session, participantToken, isHost } = useSession();
  if (!session) return null;

  async function handleStartVoting(topic: TopicData) {
    if (!session || !participantToken) return;
    await startVoting(session.code, participantToken, topic.id);
  }

  return (
    <div className="space-y-2">
      {session.topics.map((topic) => {
        const isActive = activeTopic?.id === topic.id;
        return (
          <div
            key={topic.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTopic(topic)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectTopic(topic);
              }
            }}
            className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition-all ${
              isActive
                ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-card-foreground">{topic.title}</p>
                {topic.description && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[topic.status]
                  }`}
                >
                  {STATUS_LABELS[topic.status]}
                </span>
                {isHost && topic.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartVoting(topic);
                    }}
                    className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-all hover:opacity-90"
                  >
                    Start Vote
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {session.topics.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {isHost
            ? "No topics yet. Add one above to get started."
            : "Waiting for the host to add topics..."}
        </div>
      )}
    </div>
  );
}
