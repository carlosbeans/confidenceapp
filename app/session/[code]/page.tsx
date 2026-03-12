"use client";

import { use, useEffect, useState } from "react";
import { SessionProvider } from "./_components/SessionProvider";
import { SessionView } from "./_components/SessionView";
import { JoinGate } from "./_components/JoinGate";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function SessionPage({ params }: PageProps) {
  const { code } = use(params);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const sessions = JSON.parse(
        localStorage.getItem("confidence-sessions") || "[]"
      );
      const match = sessions.find((s: { code: string }) => s.code === code);
      setHasToken(!!match?.token);
    } catch {
      setHasToken(false);
    }
  }, [code]);

  if (hasToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!hasToken) {
    return <JoinGate code={code} onJoined={() => setHasToken(true)} />;
  }

  return (
    <SessionProvider code={code}>
      <SessionView />
    </SessionProvider>
  );
}
