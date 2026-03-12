"use client";

import { motion } from "framer-motion";
import { useSession } from "./SessionProvider";
import { startRevote, closeTopic } from "@/lib/actions";
import { CONFIDENCE_LABELS } from "@/lib/types";
import type { TopicData } from "@/lib/types";

const VOTE_CARD_COLORS: Record<number, string> = {
  1: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
  2: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  3: "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  4: "border-lime-500/40 bg-lime-500/10 text-lime-600 dark:text-lime-400",
  5: "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400",
};

const DOT_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};

interface ResultsPanelProps {
  topic: TopicData;
}

export function ResultsPanel({ topic }: ResultsPanelProps) {
  const { session, participantToken, isHost } = useSession();

  const currentRoundVotes = topic.votes.filter((v) => v.round === topic.round);
  const values = currentRoundVotes.map((v) => v.value);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const spread = max - min;

  const alignmentLabel =
    spread === 0
      ? "Perfect alignment"
      : spread <= 1
      ? "Strong alignment"
      : spread <= 2
      ? "Moderate alignment"
      : "Low alignment — discuss further";

  const alignmentColor =
    spread === 0
      ? "text-green-600 dark:text-green-400"
      : spread <= 1
      ? "text-lime-600 dark:text-lime-400"
      : spread <= 2
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";

  async function handleRevote() {
    if (!session || !participantToken) return;
    await startRevote(session.code, participantToken, topic.id);
  }

  async function handleClose() {
    if (!session || !participantToken) return;
    await closeTopic(session.code, participantToken, topic.id);
  }

  return (
    <div className="space-y-6">
      {/* Alignment summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 text-center"
      >
        <div className="mb-1 text-4xl font-bold">{avg.toFixed(1)}</div>
        <p className="text-sm text-muted-foreground">Average confidence</p>
        <div className="mt-4">
          <AlignmentMeter votes={values} />
        </div>
        <p className={`mt-3 text-sm font-medium ${alignmentColor}`}>
          {alignmentLabel}
        </p>
        {topic.round > 1 && (
          <p className="mt-1 text-xs text-muted-foreground">Round {topic.round}</p>
        )}
      </motion.div>

      {/* Individual vote cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {currentRoundVotes.map((vote, i) => (
          <motion.div
            key={vote.id}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`rounded-xl border-2 p-4 text-center ${
              VOTE_CARD_COLORS[vote.value]
            }`}
          >
            <p className="text-3xl font-bold">{vote.value}</p>
            <p className="mt-1 text-xs font-medium opacity-75">
              {CONFIDENCE_LABELS[vote.value]}
            </p>
            <p className="mt-2 truncate text-sm font-medium">{vote.participantName}</p>
          </motion.div>
        ))}
      </div>

      {/* Host actions */}
      {isHost && topic.status === "revealed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-3"
        >
          <button
            onClick={handleRevote}
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted"
          >
            Re-vote
          </button>
          <button
            onClick={handleClose}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90"
          >
            Close Topic
          </button>
        </motion.div>
      )}
    </div>
  );
}

function AlignmentMeter({ votes }: { votes: number[] }) {
  if (!votes.length) return null;

  const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const v of votes) {
    buckets[v] = (buckets[v] || 0) + 1;
  }

  return (
    <div className="flex items-end justify-center gap-4">
      {[1, 2, 3, 4, 5].map((value) => (
        <div key={value} className="flex flex-col items-center gap-1">
          <div className="flex flex-col-reverse gap-1">
            {Array.from({ length: buckets[value] }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + value * 0.05 + i * 0.05 }}
                className={`h-4 w-4 rounded-full ${DOT_COLORS[value]}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}
