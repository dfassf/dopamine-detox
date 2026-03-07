import { FormField, SelectField } from "../../components/ui";
import {
  DIET_GOAL_OPTIONS,
  FREQUENCY_OPTIONS,
  type AbstinenceType,
} from "./constants";

interface AbstinenceTypeFieldsProps {
  selectedType: AbstinenceType;
  weight: string;
  height: string;
  drinkingYears: string;
  drinkingFrequency: string;
  drinkingAmount: string;
  smokingYears: string;
  dailyCigarettes: string;
  dietGoal: string;
  habitYears: string;
  onWeightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onDrinkingYearsChange: (value: string) => void;
  onDrinkingFrequencyChange: (value: string) => void;
  onDrinkingAmountChange: (value: string) => void;
  onSmokingYearsChange: (value: string) => void;
  onDailyCigarettesChange: (value: string) => void;
  onDietGoalChange: (value: string) => void;
  onHabitYearsChange: (value: string) => void;
}

export function AbstinenceTypeFields({
  selectedType,
  weight,
  height,
  drinkingYears,
  drinkingFrequency,
  drinkingAmount,
  smokingYears,
  dailyCigarettes,
  dietGoal,
  habitYears,
  onWeightChange,
  onHeightChange,
  onDrinkingYearsChange,
  onDrinkingFrequencyChange,
  onDrinkingAmountChange,
  onSmokingYearsChange,
  onDailyCigarettesChange,
  onDietGoalChange,
  onHabitYearsChange,
}: AbstinenceTypeFieldsProps) {
  if (selectedType === "alcohol") {
    return (
      <>
        <FormField label="체중 (kg)">
          <input
            type="number"
            placeholder="예: 87"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
          />
        </FormField>
        <FormField label="키 (cm)">
          <input
            type="number"
            placeholder="예: 175"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
          />
        </FormField>
        <FormField label="음주 기간 (년)">
          <input
            type="number"
            placeholder="예: 10"
            value={drinkingYears}
            onChange={(e) => onDrinkingYearsChange(e.target.value)}
          />
        </FormField>
        <SelectField
          label="음주 빈도"
          placeholder="선택해주세요"
          options={FREQUENCY_OPTIONS}
          value={drinkingFrequency}
          onChange={(e) => onDrinkingFrequencyChange(e.target.value)}
        />
        <FormField label="음주량" helper="대략적인 1회 음주량">
          <input
            type="text"
            placeholder="예: 소주 2병"
            value={drinkingAmount}
            onChange={(e) => onDrinkingAmountChange(e.target.value)}
          />
        </FormField>
      </>
    );
  }

  if (selectedType === "smoking") {
    return (
      <>
        <FormField label="흡연 기간 (년)">
          <input
            type="number"
            placeholder="예: 10"
            value={smokingYears}
            onChange={(e) => onSmokingYearsChange(e.target.value)}
          />
        </FormField>
        <FormField label="일일 흡연량 (개비)">
          <input
            type="number"
            placeholder="예: 15"
            value={dailyCigarettes}
            onChange={(e) => onDailyCigarettesChange(e.target.value)}
          />
        </FormField>
      </>
    );
  }

  if (selectedType === "diet") {
    return (
      <>
        <FormField label="체중 (kg)">
          <input
            type="number"
            placeholder="예: 70"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
          />
        </FormField>
        <FormField label="키 (cm)">
          <input
            type="number"
            placeholder="예: 170"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
          />
        </FormField>
        <SelectField
          label="목표"
          placeholder="선택해주세요"
          options={DIET_GOAL_OPTIONS}
          value={dietGoal}
          onChange={(e) => onDietGoalChange(e.target.value)}
        />
      </>
    );
  }

  return (
    <FormField label="해당 습관 기간 (년, 선택)">
      <input
        type="number"
        placeholder="모르면 비워두세요"
        value={habitYears}
        onChange={(e) => onHabitYearsChange(e.target.value)}
      />
    </FormField>
  );
}
