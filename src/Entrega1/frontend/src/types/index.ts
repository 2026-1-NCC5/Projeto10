export type ItemType = "Arroz" | "Feijao" | "Outros";

export type CollectionEntry = {
  id: string;
  itemType: ItemType;
  itemName?: string;
  quantity: number;
  weight: number;
  addedBy: string;
  addedAt: string;
  teamId?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  teamRole: "leader" | "member";
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  members: TeamMember[];
};

export type JoinRequest = {
  id: string;
  userId: string;
  userName: string;
  teamId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type CollectionSummary = {
  totalCollected: number;
  totalWeight: number;
  collectedThisMonth: number;
};

export type BatchItem = {
  itemType: ItemType;
  itemName?: string;
  quantity: number;
  weight: number;
};

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  teamId: string | null;
};

export type TeamInvitation = {
  id: string;
  teamId: string;
  teamName: string;
  invitedByName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};
