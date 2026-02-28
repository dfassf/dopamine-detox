import api from "./client";

export interface UserData {
  id: string;
  email: string;
  nickname: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserData;
}

export async function signup(
  email: string,
  password: string,
  nickname: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", {
    email,
    password,
    nickname,
  });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const { data } = await api.post<{ access_token: string }>("/auth/refresh");
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
