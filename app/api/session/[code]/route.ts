import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import type { SessionData, TopicData, VoteData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const token = request.nextUrl.searchParams.get("token");

  const session = await prisma.session.findUnique({
    where: { code },
    include: {
      participants: { orderBy: { joinedAt: "asc" } },
      topics: {
        orderBy: { order: "asc" },
        include: {
          votes: { include: { participant: true } },
          actionItems: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const currentParticipant = session.participants.find((p) => p.token === token);

  const data: SessionData = {
    id: session.id,
    code: session.code,
    name: session.name,
    createdAt: session.createdAt.toISOString(),
    participants: session.participants.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      joinedAt: p.joinedAt.toISOString(),
    })),
    topics: session.topics.map((t): TopicData => {
      const isRevealed = t.status === "revealed" || t.status === "closed";

      const votes: VoteData[] = t.votes
        .filter((v) => v.round === t.round)
        .map((v) => ({
          id: v.id,
          participantId: v.participantId,
          participantName: v.participant.name,
          value: isRevealed || v.participantId === currentParticipant?.id ? v.value : 0,
          round: v.round,
        }));

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status as TopicData["status"],
        order: t.order,
        round: t.round,
        votes,
        actionItems: t.actionItems.map((a) => ({
          id: a.id,
          text: a.text,
          createdAt: a.createdAt.toISOString(),
        })),
      };
    }),
  };

  return NextResponse.json(data);
}
