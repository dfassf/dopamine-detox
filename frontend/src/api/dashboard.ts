import api from "./client";

export interface TodayMessage {
  abstinence_id: number;
  abstinence_type: string;
  current_day: number;
  fact: string;
  feeling: string | null;
  action: string | null;
  is_proactive: boolean;
}

export interface DashboardAbstinence {
  id: number;
  type: string;
  label: string;
  current_day: number;
  current_stage: {
    stage: number;
    name: string;
    total_stages: number;
    days_to_next_stage: number;
  };
}

export interface DashboardResponse {
  today_messages: TodayMessage[];
  abstinences: DashboardAbstinence[];
  has_pending_checkin: boolean;
}

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}
