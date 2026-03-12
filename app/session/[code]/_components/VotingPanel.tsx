"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "./SessionProvider";
import { submitVote, revealVotes } from "@/lib/actions";
import { CONFIDENCE_LABELS } from "@/lib/types";
import type { TopicData } from "@/lib/types";

const CONFIDENCE_BUTTON_COLORS: Record<number, string> = {
  1: "border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400",
  2: "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  3: "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  4: "border-lime-500/30 bg-lime-500/5 hover:bg-lime-500/15 text-lime-600 dark:text-lime-400",
  5: "border-green-500/30 bg-green-500/5 hover:bg-green-500/15 text-green-600 dark:text-green-400",
};

const CONFIDENCE_SELECTED_COLORS: Record<number, string> = {
  1: "border-red-500 bg-red-500 text-white ring-2 ring-red-500/30",
  2: "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-500/30",
  3: "border-yellow-500 bg-yellow-500 text-white ring-2 ring-yellow-500/30",
  4: "border-lime-500 bg-lime-500 text-white ring-2 ring-lime-500/30",
  5: "border-green-500 bg-green-500 text-white ring-2 ring-green-500/30",
};

interface VotingPanelProps {
  topic: TopicData;
}

export function VotingPanel({ topic }: VotingPanelProps) {
  const { session, currentParticipant, participantToken, isHost } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session || !currentParticipant) return null;

  const myVote = topic.votes.find(
    (v) => v.participantId === currentParticipant.id && v.round === topic.round
  );

  const totalParticipants = session.participants.length;
  const totalVotes = topic.votes.filter((v) => v.round === topic.round).length;
  const allVoted = totalVotes >= totalParticipants;

  async function handleVote(value: number) {
    if (!participantToken) return;
    setLoading(true);
    await submitVote(session!.code, participantToken, topic.id, value);
    setLoading(false);
  }

  async function handleReveal() {
    if (!participantToken) return;
    await revealVotes(session!.code, participantToken, topic.id);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          How confident are you about this idea?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalVotes} of {totalParticipants} voted
          {topic.round > 1 && ` · Round ${topic.round}`}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((value) => {
          const isSelected = myVote?.value === value;
          return (
            <motion.button
              key={value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote(value)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-5 transition-all ${
                isSelected
                  ? CONFIDENCE_SELECTED_COLORS[value]
                  : CONFIDENCE_BUTTON_COLORS[value]
              } disabled:opacity-50`}
            >
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-xs font-medium leading-tight">
                {CONFIDENCE_LABELS[value]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {myVote && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground"
        >
          You voted <strong>{myVote.value}</strong> — {CONFIDENCE_LABELS[myVote.value]}.
          {!allVoted && " Waiting for others..."}
        </motion.p>
      )}

      {isHost && (
        <div className="flex justify-center">
          <button
            onClick={handleReveal}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              allVoted
                ? "bg-accent text-accent-foreground hover:opacity-90"
                : "border border-border bg-card text-card-foreground hover:bg-muted"
            }`}
          >
            {allVoted ? "Reveal Votes" : "Reveal Early"}
          </button>
        </div>
      )}
    </div>
  );
}
