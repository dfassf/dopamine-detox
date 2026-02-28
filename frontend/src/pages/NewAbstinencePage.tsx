import { useState } from "react";
import { useNavigate } from "react-router";
import {
  createAbstinence,
  type AbstinenceCreateRequest,
} from "../api/abstinence";
import {
  PageHeader,
  FormField,
  SelectField,
  Button,
  BottomAction,
} from "../components/ui";

const PRESETS = [
  { type: "alcohol", emoji: "\u{1F37A}", name: "금주" },
  { type: "smoking", emoji: "\u{1F6AC}", name: "금연" },
  { type: "diet", emoji: "\u{1F957}", name: "식단" },
  { type: "custom", emoji: "\u270E\uFE0F", name: "커스텀" },
] as const;

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "매일" },
  { value: "3-5", label: "주 3~5회" },
  { value: "1-2", label: "주 1~2회" },
];

const DIET_GOAL_OPTIONS = [
  { value: "diet", label: "다이어트" },
  { value: "healthy", label: "건강식 전환" },
  { value: "other", label: "기타" },
];

export default function NewAbstinencePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: 공통
  const [selectedType, setSelectedType] = useState("alcohol");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");

  // Step 2: 금주
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [drinkingYears, setDrinkingYears] = useState("");
  const [drinkingFrequency, setDrinkingFrequency] = useState("");
  const [drinkingAmount, setDrinkingAmount] = useState("");

  // Step 2: 금연
  const [smokingYears, setSmokingYears] = useState("");
  const [dailyCigarettes, setDailyCigarettes] = useState("");

  // Step 2: 식단
  const [dietGoal, setDietGoal] = useState("");

  // Step 2: 커스텀
  const [customLabel, setCustomLabel] = useState("");
  const [habitYears, setHabitYears] = useState("");

  const canProceed =
    selectedType && startDate && birthYear && gender &&
    (selectedType !== "custom" || customLabel.trim());

  const canSubmit = (() => {
    if (selectedType === "alcohol") {
      return weight && height && drinkingYears && drinkingFrequency && drinkingAmount;
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

    const req: AbstinenceCreateRequest = {
      type: selectedType,
      start_date: startDate,
      birth_year: Number(birthYear),
      gender,
    };

    if (selectedType === "alcohol") {
      req.weight = Number(weight);
      req.height = Number(height);
      req.drinking_years = Number(drinkingYears);
      req.drinking_frequency = drinkingFrequency;
      req.drinking_amount = drinkingAmount;
    } else if (selectedType === "smoking") {
      req.smoking_years = Number(smokingYears);
      req.daily_cigarettes = Number(dailyCigarettes);
    } else if (selectedType === "diet") {
      req.weight = Number(weight);
      req.height = Number(height);
      req.diet_goal = dietGoal;
    } else if (selectedType === "custom") {
      req.label = customLabel;
      if (habitYears) req.habit_years = Number(habitYears);
    }

    try {
      const result = await createAbstinence(req);
      navigate(`/timeline/${result.id}`, { replace: true });
    } catch {
      setError("타임라인 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <PageHeader
        title={step === 1 ? "디톡스 시작하기" : `${PRESETS.find((p) => p.type === selectedType)?.name} 상세 정보`}
        onBack={step === 2 ? () => setStep(1) : true}
        right={step === 2 ? <span style={{ fontSize: 13, color: "var(--gray-400)" }}>2/2</span> : undefined}
        small
      />

      {/* Content */}
      <div className="screen-content" style={{ background: "var(--white)", padding: "0 24px" }}>
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

            {/* Preset Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {PRESETS.map((p) => (
                <button
                  key={p.type}
                  onClick={() => setSelectedType(p.type)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "18px 12px",
                    borderRadius: 14,
                    border:
                      selectedType === p.type
                        ? "2px solid var(--primary)"
                        : "1.5px solid var(--gray-200)",
                    background:
                      selectedType === p.type
                        ? "var(--primary-light)"
                        : "var(--white)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{p.emoji}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color:
                        selectedType === p.type
                          ? "var(--primary-dark)"
                          : "var(--gray-700)",
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            {/* 커스텀 이름 입력 */}
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

            {/* Common fields */}
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
              options={[
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
              ]}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </>
        ) : (
          <>
            {/* Info banner */}
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

            {/* Type-specific fields */}
            {selectedType === "alcohol" && (
              <>
                <FormField label="체중 (kg)">
                  <input
                    type="number"
                    placeholder="예: 87"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </FormField>
                <FormField label="키 (cm)">
                  <input
                    type="number"
                    placeholder="예: 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </FormField>
                <FormField label="음주 기간 (년)">
                  <input
                    type="number"
                    placeholder="예: 10"
                    value={drinkingYears}
                    onChange={(e) => setDrinkingYears(e.target.value)}
                  />
                </FormField>
                <SelectField
                  label="음주 빈도"
                  placeholder="선택해주세요"
                  options={FREQUENCY_OPTIONS}
                  value={drinkingFrequency}
                  onChange={(e) => setDrinkingFrequency(e.target.value)}
                />
                <FormField label="음주량" helper="대략적인 1회 음주량">
                  <input
                    type="text"
                    placeholder="예: 소주 2병"
                    value={drinkingAmount}
                    onChange={(e) => setDrinkingAmount(e.target.value)}
                  />
                </FormField>
              </>
            )}

            {selectedType === "smoking" && (
              <>
                <FormField label="흡연 기간 (년)">
                  <input
                    type="number"
                    placeholder="예: 10"
                    value={smokingYears}
                    onChange={(e) => setSmokingYears(e.target.value)}
                  />
                </FormField>
                <FormField label="일일 흡연량 (개비)">
                  <input
                    type="number"
                    placeholder="예: 15"
                    value={dailyCigarettes}
                    onChange={(e) => setDailyCigarettes(e.target.value)}
                  />
                </FormField>
              </>
            )}

            {selectedType === "diet" && (
              <>
                <FormField label="체중 (kg)">
                  <input
                    type="number"
                    placeholder="예: 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </FormField>
                <FormField label="키 (cm)">
                  <input
                    type="number"
                    placeholder="예: 170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </FormField>
                <SelectField
                  label="목표"
                  placeholder="선택해주세요"
                  options={DIET_GOAL_OPTIONS}
                  value={dietGoal}
                  onChange={(e) => setDietGoal(e.target.value)}
                />
              </>
            )}

            {selectedType === "custom" && (
              <FormField label="해당 습관 기간 (년, 선택)">
                <input
                  type="number"
                  placeholder="모르면 비워두세요"
                  value={habitYears}
                  onChange={(e) => setHabitYears(e.target.value)}
                />
              </FormField>
            )}
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
