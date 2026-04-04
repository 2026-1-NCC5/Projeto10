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
};

export type Team = {
  id: string;
  name: string;
  description?: string;
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
