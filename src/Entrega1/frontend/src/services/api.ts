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
    throw new Error(body.detail || "Erro inesperado");
  }

  return response.json();
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string | null;
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
