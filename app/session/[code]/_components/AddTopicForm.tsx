"use client";

import { useState } from "react";
import { useSession } from "./SessionProvider";
import { addTopic } from "@/lib/actions";

export function AddTopicForm() {
  const { session, participantToken, isHost } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isHost || !session) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session || !participantToken) return;
    setLoading(true);
    await addTopic(session.code, participantToken, title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setExpanded(false);
    setLoading(false);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        + Add a topic
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Topic title"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        autoFocus
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setExpanded(false); setTitle(""); setDescription(""); }}
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Topic"}
        </button>
      </div>
    </form>
  );
}
