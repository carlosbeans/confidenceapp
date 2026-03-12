"use server";

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function createSession(hostName: string, sessionName: string) {
  const code = nanoid(6).toUpperCase();
  const token = nanoid(24);

  const session = await prisma.session.create({
    data: {
      code,
      name: sessionName,
      participants: {
        create: {
          name: hostName,
          token,
          isHost: true,
        },
      },
    },
    include: { participants: true },
  });

  return { code: session.code, token, participantId: session.participants[0].id };
}

export async function joinSession(code: string, name: string) {
  const session = await prisma.session.findUnique({ where: { code } });
  if (!session) return { error: "Session not found" };

  const existing = await prisma.participant.findFirst({
    where: { sessionId: session.id, name },
  });
  if (existing) {
    return { code: session.code, token: existing.token, participantId: existing.id };
  }

  const token = nanoid(24);
  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      name,
      token,
      isHost: false,
    },
  });

  return { code: session.code, token, participantId: participant.id };
}

export async function addTopic(
  sessionCode: string,
  participantToken: string,
  title: string,
  description: string = ""
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true, topics: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant?.isHost) return { error: "Only the host can add topics" };

  const maxOrder = session.topics.reduce((max, t) => Math.max(max, t.order), 0);

  const topic = await prisma.topic.create({
    data: {
      sessionId: session.id,
      title,
      description,
      order: maxOrder + 1,
    },
  });

  return { topicId: topic.id };
}

export async function startVoting(
  sessionCode: string,
  participantToken: string,
  topicId: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant?.isHost) return { error: "Only the host can start voting" };

  await prisma.topic.update({
    where: { id: topicId },
    data: { status: "voting" },
  });

  return { success: true };
}

export async function submitVote(
  sessionCode: string,
  participantToken: string,
  topicId: string,
  value: number
) {
  if (value < 1 || value > 5) return { error: "Vote must be between 1 and 5" };

  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant) return { error: "Participant not found" };

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic || topic.status !== "voting") return { error: "Voting is not open for this topic" };

  await prisma.vote.upsert({
    where: {
      topicId_participantId_round: {
        topicId,
        participantId: participant.id,
        round: topic.round,
      },
    },
    update: { value },
    create: {
      topicId,
      participantId: participant.id,
      value,
      round: topic.round,
    },
  });

  return { success: true };
}

export async function revealVotes(
  sessionCode: string,
  participantToken: string,
  topicId: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant?.isHost) return { error: "Only the host can reveal votes" };

  await prisma.topic.update({
    where: { id: topicId },
    data: { status: "revealed" },
  });

  return { success: true };
}

export async function startRevote(
  sessionCode: string,
  participantToken: string,
  topicId: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant?.isHost) return { error: "Only the host can start a re-vote" };

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) return { error: "Topic not found" };

  await prisma.topic.update({
    where: { id: topicId },
    data: { status: "voting", round: topic.round + 1 },
  });

  return { success: true };
}

export async function closeTopic(
  sessionCode: string,
  participantToken: string,
  topicId: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant?.isHost) return { error: "Only the host can close topics" };

  await prisma.topic.update({
    where: { id: topicId },
    data: { status: "closed" },
  });

  return { success: true };
}

export async function addActionItem(
  sessionCode: string,
  participantToken: string,
  topicId: string,
  text: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant) return { error: "Participant not found" };

  const item = await prisma.actionItem.create({
    data: { topicId, text },
  });

  return { actionItemId: item.id };
}

export async function deleteActionItem(
  sessionCode: string,
  participantToken: string,
  actionItemId: string
) {
  const session = await prisma.session.findUnique({
    where: { code: sessionCode },
    include: { participants: true },
  });
  if (!session) return { error: "Session not found" };

  const participant = session.participants.find((p) => p.token === participantToken);
  if (!participant) return { error: "Participant not found" };

  await prisma.actionItem.delete({ where: { id: actionItemId } });

  return { success: true };
}
