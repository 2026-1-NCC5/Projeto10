import type {
  Team,
  TeamMember,
  BatchItem,
  UserSummary,
  TeamValidation,
  DashboardSummary,
  DashboardAllSummary,
  DashboardComparison,
  OperatorComparisonResponse,
  FoodDistributionResponse,
  AIDetection,
  CollectionEntry,
} from "../types";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";


async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...restOptions,
    headers: { "Content-Type": "application/json", ...customHeaders },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = Array.isArray(body.detail)
      ? body.detail.map((e: { msg?: string }) => e.msg ?? "Erro").join("; ")
      : body.detail;
    throw new Error(detail || "Erro inesperado");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}


export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string | null;
  team_id: string | null;
}


export interface AuthData {
  token: string;
  user: UserData;
}


const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });


export async function login(email: string, password: string): Promise<AuthData> {
  return request<AuthData>(API_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthData> {
  return request<AuthData>(API_URL, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}


export async function selectRole(token: string, role: string): Promise<UserData> {
  return request<UserData>(API_URL, "/users/me/role", {
    method: "PUT",
    body: JSON.stringify({ role }),
    headers: authHeaders(token),
  });
}


export async function getMe(token: string): Promise<UserData> {
  return request<UserData>(API_URL, "/users/me", { headers: authHeaders(token) });
}


export async function getUsers(
  token: string,
  options?: { unassigned?: boolean; role?: string }
): Promise<UserSummary[]> {
  const params = new URLSearchParams();
  if (options?.unassigned) params.set("unassigned", "true");
  if (options?.role) params.set("role", options.role);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request<UserSummary[]>(API_URL, `/users${qs}`, {
    headers: authHeaders(token),
  });
}


export async function getTeams(token: string): Promise<Team[]> {
  return request<Team[]>(API_URL, "/teams", { headers: authHeaders(token) });
}


export async function getMyTeam(token: string): Promise<Team | null> {
  return request<Team | null>(API_URL, "/teams/me", { headers: authHeaders(token) });
}


export async function createTeam(
  token: string,
  payload: {
    name: string;
    description?: string;
    coordinatorIds: string[];
    memberIds: string[];
  }
): Promise<Team> {
  return request<Team>(API_URL, "/teams", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      coordinator_ids: payload.coordinatorIds,
      member_ids: payload.memberIds,
    }),
    headers: authHeaders(token),
  });
}


export async function updateTeam(
  token: string,
  teamId: string,
  patch: { name?: string; description?: string }
): Promise<Team> {
  return request<Team>(API_URL, `/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: authHeaders(token),
  });
}


export async function deleteTeam(token: string, teamId: string): Promise<void> {
  await request<void>(API_URL, `/teams/${teamId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}


export async function validateTeam(
  token: string,
  teamId: string
): Promise<TeamValidation> {
  return request<TeamValidation>(API_URL, `/teams/${teamId}/validate`, {
    headers: authHeaders(token),
  });
}


export async function addTeamMember(
  token: string,
  teamId: string,
  userId: string
): Promise<TeamMember> {
  return request<TeamMember>(API_URL, `/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
    headers: authHeaders(token),
  });
}


export async function removeTeamMember(
  token: string,
  teamId: string,
  userId: string
): Promise<void> {
  await request<void>(API_URL, `/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}


export async function reallocateMember(
  token: string,
  targetTeamId: string,
  userId: string
): Promise<TeamMember> {
  return request<TeamMember>(API_URL, `/teams/${targetTeamId}/reallocate`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
    headers: authHeaders(token),
  });
}


export async function submitBatch(
  token: string,
  items: BatchItem[]
): Promise<{ batchId: string }> {
  return request<{ batchId: string }>(API_URL, "/collections/batch", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({
        item_type: item.itemType,
        item_name: item.itemName,
        quantity: item.quantity,
        weight: item.weight,
      })),
    }),
    headers: authHeaders(token),
  });
}


export type PublicOverview = {
  totalCollectedG: number;
  collectorsCount: number;
  categories: { category: string; totalG: number; count: number }[];
  items: { itemName: string; category: string; totalG: number; count: number }[];
  timeseries: { date: string; totalG: number; count: number }[];
};


export type RankingItem = {
  rank: number;
  teamId: string;
  teamName: string;
  totalG: number;
  detectionCount: number;
};


export type RankingResponse = {
  total: number;
  items: RankingItem[];
};


function snakeToCamel<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => snakeToCamel(v)) as unknown as T;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = snakeToCamel(v);
    }
    return out as T;
  }
  return value as T;
}


export async function getPublicOverview(params: {
  from?: string | null;
  to?: string | null;
}): Promise<PublicOverview> {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const raw = await request<Record<string, unknown>>(
    API_URL,
    `/public/dashboard/overview${suffix}`
  );
  return snakeToCamel<PublicOverview>(raw);
}


export async function getPublicFilters(): Promise<{ minDate: string | null; maxDate: string | null }> {
  const raw = await request<Record<string, unknown>>(API_URL, "/public/dashboard/filters");
  return snakeToCamel<{ minDate: string | null; maxDate: string | null }>(raw);
}


export async function getRanking(
  token: string,
  limit = 15,
  offset = 0
): Promise<RankingResponse> {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const raw = await request<Record<string, unknown>>(
    API_URL,
    `/ranking/teams?${qs.toString()}`,
    { headers: authHeaders(token) }
  );
  return snakeToCamel<RankingResponse>(raw);
}


export async function getDashboardSummary(
  token: string,
  teamId: string
): Promise<DashboardSummary> {
  return request<DashboardSummary>(
    API_URL,
    `/dashboard/summary?team_id=${encodeURIComponent(teamId)}`,
    { headers: authHeaders(token) }
  );
}


export async function getDashboardAllSummary(
  token: string
): Promise<DashboardAllSummary> {
  return request<DashboardAllSummary>(API_URL, "/dashboard/summary/all", {
    headers: authHeaders(token),
  });
}


export async function getDashboardComparison(
  token: string,
  teamId: string
): Promise<DashboardComparison> {
  return request<DashboardComparison>(
    API_URL,
    `/dashboard/comparison?team_id=${encodeURIComponent(teamId)}`,
    { headers: authHeaders(token) }
  );
}


export async function getOperatorComparison(
  token: string,
  teamId: string
): Promise<OperatorComparisonResponse> {
  return request<OperatorComparisonResponse>(
    API_URL,
    `/dashboard/comparison/by-operator?team_id=${encodeURIComponent(teamId)}`,
    { headers: authHeaders(token) }
  );
}


export async function getFoodDistribution(
  token: string,
  teamId: string
): Promise<FoodDistributionResponse> {
  return request<FoodDistributionResponse>(
    API_URL,
    `/dashboard/food-distribution?team_id=${encodeURIComponent(teamId)}`,
    { headers: authHeaders(token) }
  );
}


export async function getAIDetections(
  token: string,
  teamId: string
): Promise<AIDetection[]> {
  return request<AIDetection[]>(
    API_URL,
    `/ai-detections?team_id=${encodeURIComponent(teamId)}`,
    { headers: authHeaders(token) }
  );
}


export async function getMyCollections(token: string): Promise<CollectionEntry[]> {
  return request<CollectionEntry[]>(API_URL, "/collections/me", {
    headers: authHeaders(token),
  });
}


export async function getTeamCollections(
  token: string,
  teamId: string
): Promise<CollectionEntry[]> {
  return request<CollectionEntry[]>(API_URL, `/collections/team/${teamId}`, {
    headers: authHeaders(token),
  });
}


export interface TeamDraftDiff {
  metaChanged: boolean;
  name?: string;
  description?: string;
  toAdd: string[];
  toRemove: string[];
}


export async function saveTeamDraft(
  token: string,
  teamId: string,
  diff: TeamDraftDiff
): Promise<void> {
  if (diff.metaChanged) {
    await updateTeam(token, teamId, {
      name: diff.name,
      description: diff.description,
    });
  }
  for (const userId of diff.toAdd) {
    await addTeamMember(token, teamId, userId);
  }
  for (const userId of diff.toRemove) {
    await removeTeamMember(token, teamId, userId);
  }
}
