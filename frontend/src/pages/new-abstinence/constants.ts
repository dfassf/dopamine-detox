export const PRESETS = [
  { type: "alcohol", emoji: "\u{1F37A}", name: "금주" },
  { type: "smoking", emoji: "\u{1F6AC}", name: "금연" },
  { type: "diet", emoji: "\u{1F957}", name: "식단" },
  { type: "custom", emoji: "\u270E\uFE0F", name: "커스텀" },
] as const;

export type AbstinenceType = (typeof PRESETS)[number]["type"];

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "매일" },
  { value: "3-5", label: "주 3~5회" },
  { value: "1-2", label: "주 1~2회" },
];

export const DIET_GOAL_OPTIONS = [
  { value: "diet", label: "다이어트" },
  { value: "healthy", label: "건강식 전환" },
  { value: "other", label: "기타" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];
