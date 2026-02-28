import api from "./client";

export interface AbstinenceCreateRequest {
  type: string;
  start_date: string;
  birth_year: number;
  gender: string;
  label?: string;
  weight?: number;
  height?: number;
  drinking_years?: number;
  drinking_frequency?: string;
  drinking_amount?: string;
  smoking_years?: number;
  daily_cigarettes?: number;
  diet_goal?: string;
  habit_years?: number;
}

export interface AbstinenceResponse {
  id: string;
  type: string;
  label: string;
  start_date: string;
  current_day: number;
  timeline_generated: boolean;
}

export interface AbstinenceListItem {
  id: string;
  type: string;
  label: string;
  start_date: string;
  current_day: number;
}

export interface TimelineEvent {
  day: number;
  fact: string;
  feeling: string | null;
  action: string | null;
  is_proactive: boolean;
  status: "past" | "current" | "upcoming";
}

export interface TimelineStage {
  stage: number;
  name: string;
  day_from: number;
  day_to: number;
  summary: string;
  status: "completed" | "current" | "upcoming";
  events: TimelineEvent[] | null;
}

export interface CurrentStage {
  stage: number;
  name: string;
  day_from: number;
  day_to: number;
  summary: string;
  progress_in_stage: number;
  days_to_next_stage: number;
}

export interface TimelineResponse {
  abstinence: AbstinenceListItem;
  current_stage: CurrentStage;
  stages: TimelineStage[];
}

export async function createAbstinence(
  data: AbstinenceCreateRequest
): Promise<AbstinenceResponse> {
  const { data: res } = await api.post<AbstinenceResponse>("/abstinence", data);
  return res;
}

export async function listAbstinences(): Promise<AbstinenceListItem[]> {
  const { data } = await api.get<AbstinenceListItem[]>("/abstinence");
  return data;
}

export async function getTimeline(
  abstinenceId: string
): Promise<TimelineResponse> {
  const { data } = await api.get<TimelineResponse>(
    `/abstinence/${abstinenceId}/timeline`
  );
  return data;
}

export async function deleteAbstinence(
  abstinenceId: string
): Promise<void> {
  await api.delete(`/abstinence/${abstinenceId}`);
}
