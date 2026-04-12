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
  maxMembers: number;
  members: TeamMember[];
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


export type TeamValidation = {
  valid: boolean;
  issues: string[];
};


export type DashboardCategory = {
  category: string;
  totalWeightG: number;
  count: number;
};


export type DashboardTimeseriesPoint = {
  date: string;
  totalWeightG: number;
  count: number;
};


export type DashboardSummary = {
  teamId: string;
  teamName: string | null;
  totals: {
    rice_g: number;
    beans_g: number;
    others_g: number;
    total_g: number;
  };
  countsByCategory: DashboardCategory[];
  timeseries: DashboardTimeseriesPoint[];
};


export type DashboardTeamSummary = {
  teamId: string;
  teamName: string;
  totalWeightG: number;
  totalCount: number;
  byCategory: DashboardCategory[];
};


export type DashboardAllSummary = {
  teams: DashboardTeamSummary[];
};


export type ComparisonEvidence = {
  detectionId: string;
  imageUrl: string | null;
  detectedAt: string;
  confidence: number;
  itemName?: string | null;
};


export type OperatorComparison = {
  operatorName: string;
  manualWeightG: number;
  manualCount: number;
  aiWeightG: number;
  aiCount: number;
};


export type OperatorComparisonResponse = {
  teamId: string;
  operators: OperatorComparison[];
};


export type AIDetection = {
  id: string;
  itemName: string;
  category: string;
  estimatedWeightG: number | null;
  confidence: number;
  detectedAt: string;
  teamId: string;
  operatorName: string | null;
  s3Key: string | null;
  imageUrl: string | null;
};


export type ComparisonCategory = {
  category: string;
  manualCount: number;
  manualWeightG: number;
  aiCount: number;
  aiWeightG: number;
  match: boolean;
  evidence: ComparisonEvidence[];
};


export type DashboardComparison = {
  teamId: string;
  categories: ComparisonCategory[];
};


export type FoodDistributionItem = {
  itemName: string;
  category: string;
  manualCount: number;
  manualWeightG: number;
  aiCount: number;
  aiWeightG: number;
};


export type FoodDistributionResponse = {
  teamId: string;
  items: FoodDistributionItem[];
};
