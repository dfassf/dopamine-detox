import api from "./client";

export interface CheckinRequest {
  exercise: boolean;
  sleep_quality: string;
  regular_meals: boolean;
  had_craving: boolean;
}

export interface CheckinResponse {
  message: string;
  adjustments_summary: string;
  next_checkin_date: string;
}

export async function submitCheckin(
  abstinenceId: number,
  data: CheckinRequest
): Promise<CheckinResponse> {
  const { data: res } = await api.post<CheckinResponse>(
    `/abstinence/${abstinenceId}/checkin`,
    data
  );
  return res;
}
