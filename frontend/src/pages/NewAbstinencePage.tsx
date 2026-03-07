import { useState } from "react";
import { useNavigate } from "react-router";
import { createAbstinence } from "../api/abstinence";
import {
  PageHeader,
  FormField,
  SelectField,
  Button,
  BottomAction,
} from "../components/ui";
import {
  GENDER_OPTIONS,
  PRESETS,
  type AbstinenceType,
} from "./new-abstinence/constants";
import { buildAbstinenceRequest } from "./new-abstinence/build-request";
import { AbstinenceTypeFields } from "./new-abstinence/AbstinenceTypeFields";

export default function NewAbstinencePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedType, setSelectedType] = useState<AbstinenceType>("alcohol");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [drinkingYears, setDrinkingYears] = useState("");
  const [drinkingFrequency, setDrinkingFrequency] = useState("");
  const [drinkingAmount, setDrinkingAmount] = useState("");
  const [smokingYears, setSmokingYears] = useState("");
  const [dailyCigarettes, setDailyCigarettes] = useState("");
  const [dietGoal, setDietGoal] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [habitYears, setHabitYears] = useState("");
  const canProceed =
    selectedType &&
    startDate &&
    birthYear &&
    gender &&
    (selectedType !== "custom" || customLabel.trim());

  const canSubmit = (() => {
    if (selectedType === "alcohol") {
      return (
        weight &&
        height &&
        drinkingYears &&
        drinkingFrequency &&
        drinkingAmount
      );
    }
    if (selectedType === "smoking") {
      return smokingYears && dailyCigarettes;
    }
    if (selectedType === "diet") {
      return weight && height && dietGoal;
    }
    if (selectedType === "custom") {
      return customLabel;
    }
    return false;
  })();
  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const result = await createAbstinence(
        buildAbstinenceRequest({
          selectedType,
          startDate,
          birthYear,
          gender,
          weight,
          height,
          drinkingYears,
          drinkingFrequency,
          drinkingAmount,
          smokingYears,
          dailyCigarettes,
          dietGoal,
          customLabel,
          habitYears,
        })
      );
      navigate(`/timeline/${result.id}`, { replace: true });
    } catch {
      setError("타임라인 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPreset = PRESETS.find((preset) => preset.type === selectedType);

  return (
    <div className="screen">
      <PageHeader
        title={
          step === 1
            ? "디톡스 시작하기"
            : `${selectedPreset?.name || "디톡스"} 상세 정보`
        }
        onBack={step === 2 ? () => setStep(1) : true}
        right={
          step === 2 ? (
            <span style={{ fontSize: 13, color: "var(--gray-400)" }}>2/2</span>
          ) : undefined
        }
        small
      />

      <div
        className="screen-content"
        style={{ background: "var(--white)", padding: "0 24px" }}
      >
        {step === 1 ? (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--gray-500)",
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              무엇을 디톡스하시나요?
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() => setSelectedType(preset.type)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "18px 12px",
                    borderRadius: 14,
                    border:
                      selectedType === preset.type
                        ? "2px solid var(--primary)"
                        : "1.5px solid var(--gray-200)",
                    background:
                      selectedType === preset.type
                        ? "var(--primary-light)"
                        : "var(--white)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{preset.emoji}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color:
                        selectedType === preset.type
                          ? "var(--primary-dark)"
                          : "var(--gray-700)",
                    }}
                  >
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {selectedType === "custom" && (
              <FormField label="디톡스 대상">
                <input
                  type="text"
                  placeholder="예: 카페인, 야식, SNS"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </FormField>
            )}

            <FormField label="시작일">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="생년">
              <input
                type="number"
                placeholder="예: 1989"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />
            </FormField>
            <SelectField
              label="성별"
              placeholder="선택해주세요"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </>
        ) : (
          <>
            <div
              style={{
                background: "var(--primary-light)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "var(--primary-dark)",
                  fontWeight: 600,
                }}
              >
                개인화 타임라인 생성에 사용됩니다
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--gray-500)",
                  marginTop: 4,
                }}
              >
                정확할수록 타임라인이 더 정확해집니다
              </div>
            </div>

            {error && <div className="error-toast">{error}</div>}

            <AbstinenceTypeFields
              selectedType={selectedType}
              weight={weight}
              height={height}
              drinkingYears={drinkingYears}
              drinkingFrequency={drinkingFrequency}
              drinkingAmount={drinkingAmount}
              smokingYears={smokingYears}
              dailyCigarettes={dailyCigarettes}
              dietGoal={dietGoal}
              habitYears={habitYears}
              onWeightChange={setWeight}
              onHeightChange={setHeight}
              onDrinkingYearsChange={setDrinkingYears}
              onDrinkingFrequencyChange={setDrinkingFrequency}
              onDrinkingAmountChange={setDrinkingAmount}
              onSmokingYearsChange={setSmokingYears}
              onDailyCigarettesChange={setDailyCigarettes}
              onDietGoalChange={setDietGoal}
              onHabitYearsChange={setHabitYears}
            />
          </>
        )}
      </div>

      <BottomAction>
        {step === 1 ? (
          <Button disabled={!canProceed} onClick={() => setStep(2)}>
            다음
          </Button>
        ) : (
          <Button
            disabled={!canSubmit}
            loading={loading}
            loadingText="타임라인 생성 중..."
            onClick={handleSubmit}
          >
            타임라인 생성하기
          </Button>
        )}
      </BottomAction>
    </div>
  );
}
