import api from "./client";

export interface CheckinQuestionOption {
  label: string;
  value: string;
}

export interface CheckinQuestion {
  key: string;
  title: string;
  type: string; // "toggle" | "select"
  options: CheckinQuestionOption[];
}

export interface CheckinQuestionsResponse {
  questions: CheckinQuestion[];
}

export interface CheckinRequest {
  answers: Record<string, string>;
}

export interface CheckinResponse {
  message: string;
  adjustments_summary: string;
  next_checkin_date: string;
}

export async function getCheckinQuestions(
  abstinenceId: string
): Promise<CheckinQuestionsResponse> {
  const { data } = await api.get<CheckinQuestionsResponse>(
    `/abstinence/${abstinenceId}/checkin/questions`
  );
  return data;
}

export async function submitCheckin(
  abstinenceId: string,
  data: CheckinRequest
): Promise<CheckinResponse> {
  const { data: res } = await api.post<CheckinResponse>(
    `/abstinence/${abstinenceId}/checkin`,
    data
  );
  return res;
}
