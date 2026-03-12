"use client";

import { useSession } from "./SessionProvider";
import type { TopicData } from "@/lib/types";

interface ParticipantAvatarsProps {
  activeTopic?: TopicData | null;
}

export function ParticipantAvatars({ activeTopic }: ParticipantAvatarsProps) {
  const { session, currentParticipant } = useSession();
  if (!session) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {session.participants.map((p) => {
        const hasVoted =
          activeTopic?.status === "voting" &&
          activeTopic.votes.some((v) => v.participantId === p.id);
        const isYou = p.id === currentParticipant?.id;

        return (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                p.isHost ? "bg-accent" : "bg-muted-foreground"
              }`}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">
              {p.name}
              {isYou && <span className="text-muted-foreground"> (you)</span>}
            </span>
            {p.isHost && (
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
                Host
              </span>
            )}
            {activeTopic?.status === "voting" && (
              <span className={`text-sm ${hasVoted ? "text-green-500" : "text-muted-foreground"}`}>
                {hasVoted ? "✓" : "…"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
