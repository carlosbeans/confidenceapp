export interface SessionData {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  participants: ParticipantData[];
  topics: TopicData[];
}

export interface ParticipantData {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface TopicData {
  id: string;
  title: string;
  description: string;
  status: "pending" | "voting" | "revealed" | "closed";
  order: number;
  round: number;
  votes: VoteData[];
  actionItems: ActionItemData[];
}

export interface VoteData {
  id: string;
  participantId: string;
  participantName: string;
  value: number;
  round: number;
}

export interface ActionItemData {
  id: string;
  text: string;
  createdAt: string;
}

export const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Not confident",
  2: "Slightly confident",
  3: "Somewhat confident",
  4: "Confident",
  5: "Very confident",
};

export const CONFIDENCE_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};
