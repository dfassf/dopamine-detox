import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { submitCheckin, type CheckinResponse } from "../api/checkin";

type SleepQuality = "good" | "normal" | "bad";

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<boolean | null>(null);
  const [sleep, setSleep] = useState<SleepQuality | null>(null);
  const [meals, setMeals] = useState<boolean | null>(null);
  const [craving, setCraving] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResponse | null>(null);

  const canSubmit =
    exercise !== null && sleep !== null && meals !== null && craving !== null;

  async function handleSubmit() {
    if (!canSubmit || !id) return;
    setLoading(true);
    try {
      const res = await submitCheckin(Number(id), {
        exercise: exercise!,
        sleep_quality: sleep!,
        regular_meals: meals!,
        had_craving: craving!,
      });
      setResult(res);
    } catch {
      setResult({
        message: "체크인 처리 중 오류가 발생했습니다.",
        adjustments_summary: "다시 시도해주세요.",
        next_checkin_date: "",
      });
    } finally {
      setLoading(false);
    }
  }

  // 결과 화면
  if (result) {
    return (
      <div className="screen">
        <div className="app-header">
          <div className="back-header">
            <h1 style={{ fontSize: 18 }}>체크인 완료</h1>
          </div>
        </div>
        <div
          className="screen-content"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>{"\u2705"}</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--gray-900)",
              marginBottom: 12,
            }}
          >
            {result.message}
          </h2>
          <div
            style={{
              background: "var(--primary-light)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "var(--primary-dark)",
                fontWeight: 600,
                lineHeight: 1.6,
              }}
            >
              {result.adjustments_summary}
            </div>
          </div>
          {result.next_checkin_date && (
            <p
              style={{
                fontSize: 13,
                color: "var(--gray-500)",
                marginBottom: 24,
              }}
            >
              다음 체크인: {result.next_checkin_date}
            </p>
          )}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="app-header">
        <div className="back-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gray-700)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 style={{ fontSize: 18 }}>주간 체크인</h1>
        </div>
      </div>

      <div className="screen-content" style={{ padding: "0 0 24px" }}>
        <div
          style={{
            padding: "8px 20px 16px",
            fontSize: 14,
            color: "var(--gray-500)",
            lineHeight: 1.5,
          }}
        >
          이번 주 상태를 알려주세요.
          <br />
          타임라인을 더 정확하게 조정해드립니다.
        </div>

        {/* Q1: Exercise */}
        <Question title="이번 주 운동 했나요?">
          <ToggleOptions
            options={[
              { label: "네", value: true },
              { label: "아니오", value: false },
            ]}
            selected={exercise}
            onChange={setExercise}
          />
        </Question>

        {/* Q2: Sleep */}
        <Question title="수면은 어땠나요?">
          <TripleOptions
            options={[
              { label: "좋음", value: "good" },
              { label: "보통", value: "normal" },
              { label: "나쁨", value: "bad" },
            ]}
            selected={sleep}
            onChange={setSleep}
          />
        </Question>

        {/* Q3: Meals */}
        <Question title="식사는 규칙적이었나요?">
          <ToggleOptions
            options={[
              { label: "네", value: true },
              { label: "아니오", value: false },
            ]}
            selected={meals}
            onChange={setMeals}
          />
        </Question>

        {/* Q4: Craving */}
        <Question title="충동이 있었나요?">
          <ToggleOptions
            options={[
              { label: "네", value: true },
              { label: "아니오", value: false },
            ]}
            selected={craving}
            onChange={setCraving}
          />
        </Question>
      </div>

      {/* Bottom button */}
      <div
        style={{
          padding: "16px 24px",
          paddingBottom: 32,
          background: "var(--white)",
        }}
      >
        <button
          className="btn btn-primary"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? "분석 중..." : "체크인 완료"}
        </button>
      </div>
    </div>
  );
}

function Question({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--white)",
        margin: "0 16px 10px",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <h4
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--gray-900)",
          marginBottom: 14,
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function ToggleOptions<T>({
  options,
  selected,
  onChange,
}: {
  options: { label: string; value: T }[];
  selected: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 10,
            border:
              selected === opt.value
                ? "2px solid var(--primary)"
                : "1.5px solid var(--gray-200)",
            background:
              selected === opt.value
                ? "var(--primary-light)"
                : "var(--white)",
            color:
              selected === opt.value
                ? "var(--primary-dark)"
                : "var(--gray-700)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TripleOptions<T>({
  options,
  selected,
  onChange,
}: {
  options: { label: string; value: T }[];
  selected: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 10,
            border:
              selected === opt.value
                ? "2px solid var(--primary)"
                : "1.5px solid var(--gray-200)",
            background:
              selected === opt.value
                ? "var(--primary-light)"
                : "var(--white)",
            color:
              selected === opt.value
                ? "var(--primary-dark)"
                : "var(--gray-700)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
