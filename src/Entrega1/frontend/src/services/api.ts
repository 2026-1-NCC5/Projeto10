import type {
  Team,
  TeamMember,
  JoinRequest,
  CollectionEntry,
  CollectionSummary,
  BatchItem,
  UserSummary,
  TeamInvitation,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
const CAMERA_URL = import.meta.env.VITE_CAMERA_URL || "http://localhost:8000";


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

export async function selectRole(
  token: string,
  role: string
): Promise<UserData> {
  return request<UserData>(API_URL, "/users/me/role", {
    method: "PUT",
    body: JSON.stringify({ role }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMe(token: string): Promise<UserData> {
  return request<UserData>(API_URL, "/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCameraStreamUrl(sessionId: string): string {
  return `${CAMERA_URL}/api/sessions/${sessionId}/stream`;
}

export function getCameraWsUrl(sessionId: string): string {
  const wsBase = CAMERA_URL.replace(/^http/, "ws");
  return `${wsBase}/ws/sessions/${sessionId}`;
}

export async function getUsers(
  token: string,
  available?: boolean
): Promise<UserSummary[]> {
  const qs = available === true ? "?available=true" : "";
  return request<UserSummary[]>(API_URL, `/users${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTeams(token: string): Promise<Team[]> {
  return request<Team[]>(API_URL, "/teams", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createTeam(
  token: string,
  payload: { name: string; description?: string; maxMembers?: number; leaderId?: string }
): Promise<Team> {
  return request<Team>(API_URL, "/teams", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      max_members: payload.maxMembers,
      leader_id: payload.leaderId,
    }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addTeamMember(
  token: string,
  teamId: string,
  userId: string,
  role?: "member" | "leader"
): Promise<TeamMember> {
  return request<TeamMember>(API_URL, `/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role: role ?? "member" }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeTeamMember(
  token: string,
  teamId: string,
  userId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Erro ao remover membro");
  }
}

export async function requestJoinTeam(
  token: string,
  teamId: string
): Promise<JoinRequest> {
  return request<JoinRequest>(API_URL, `/teams/${teamId}/join-requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTeamJoinRequests(
  token: string,
  teamId: string
): Promise<JoinRequest[]> {
  return request<JoinRequest[]>(API_URL, `/teams/${teamId}/join-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveJoinRequest(
  token: string,
  teamId: string,
  requestId: string,
  newStatus: "approved" | "rejected"
): Promise<JoinRequest> {
  return request<JoinRequest>(API_URL, `/teams/${teamId}/join-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getUserHistory(token: string): Promise<CollectionEntry[]> {
  return request<CollectionEntry[]>(API_URL, "/collections/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTeamHistory(
  token: string,
  teamId: string
): Promise<CollectionEntry[]> {
  return request<CollectionEntry[]>(API_URL, `/collections/team/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTeamSummary(
  token: string,
  teamId: string
): Promise<CollectionSummary> {
  return request<CollectionSummary>(API_URL, `/collections/team/${teamId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyInvitations(token: string): Promise<TeamInvitation[]> {
  return request<TeamInvitation[]>(API_URL, "/invitations/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function acceptInvitation(token: string, invitationId: string): Promise<TeamInvitation> {
  return request<TeamInvitation>(API_URL, `/invitations/${invitationId}/accept`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rejectInvitation(token: string, invitationId: string): Promise<TeamInvitation> {
  return request<TeamInvitation>(API_URL, `/invitations/${invitationId}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendInvitation(
  token: string,
  teamId: string,
  userId: string
): Promise<TeamInvitation> {
  return request<TeamInvitation>(API_URL, `/teams/${teamId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
  });
}
