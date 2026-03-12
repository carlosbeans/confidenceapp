"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "./SessionProvider";
import { addActionItem, deleteActionItem } from "@/lib/actions";
import type { TopicData } from "@/lib/types";

interface ActionItemsProps {
  topic: TopicData;
}

export function ActionItems({ topic }: ActionItemsProps) {
  const { session, participantToken } = useSession();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !session || !participantToken) return;
    setLoading(true);
    await addActionItem(session.code, participantToken, topic.id, text.trim());
    setText("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!session || !participantToken) return;
    await deleteActionItem(session.code, participantToken, id);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Action Items
      </h3>

      <AnimatePresence mode="popLayout">
        {topic.actionItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="group flex items-start gap-3 border-b border-border py-3 last:border-0"
          >
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <p className="min-w-0 flex-1 text-sm text-card-foreground">{item.text}</p>
            <button
              onClick={() => handleDelete(item.id)}
              className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              title="Remove"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {topic.actionItems.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          No action items yet. Add next steps below.
        </p>
      )}

      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a next step..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
      </form>
    </div>
  );
}
