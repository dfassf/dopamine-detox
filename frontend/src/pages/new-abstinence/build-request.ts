import type { AbstinenceCreateRequest } from "../../api/abstinence";
import type { AbstinenceType } from "./constants";

interface BuildAbstinenceRequestInput {
  selectedType: AbstinenceType;
  startDate: string;
  birthYear: string;
  gender: string;
  weight: string;
  height: string;
  drinkingYears: string;
  drinkingFrequency: string;
  drinkingAmount: string;
  smokingYears: string;
  dailyCigarettes: string;
  dietGoal: string;
  customLabel: string;
  habitYears: string;
}

export function buildAbstinenceRequest(
  input: BuildAbstinenceRequestInput
): AbstinenceCreateRequest {
  const req: AbstinenceCreateRequest = {
    type: input.selectedType,
    start_date: input.startDate,
    birth_year: Number(input.birthYear),
    gender: input.gender,
  };

  if (input.selectedType === "alcohol") {
    req.weight = Number(input.weight);
    req.height = Number(input.height);
    req.drinking_years = Number(input.drinkingYears);
    req.drinking_frequency = input.drinkingFrequency;
    req.drinking_amount = input.drinkingAmount;
  } else if (input.selectedType === "smoking") {
    req.smoking_years = Number(input.smokingYears);
    req.daily_cigarettes = Number(input.dailyCigarettes);
  } else if (input.selectedType === "diet") {
    req.weight = Number(input.weight);
    req.height = Number(input.height);
    req.diet_goal = input.dietGoal;
  } else if (input.selectedType === "custom") {
    req.label = input.customLabel;
    if (input.habitYears) {
      req.habit_years = Number(input.habitYears);
    }
  }

  return req;
}
