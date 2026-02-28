import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getCheckinQuestions,
  submitCheckin,
  type CheckinQuestion,
  type CheckinResponse,
} from "../api/checkin";
import {
  PageHeader,
  Card,
  SelectionGroup,
  Button,
  BottomAction,
  LoadingState,
} from "../components/ui";

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<CheckinQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    getCheckinQuestions(id)
      .then((res) => setQuestions(res.questions))
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQuestions(false));
  }, [id]);

  const canSubmit =
    questions.length > 0 && questions.every((q) => answers[q.key] != null);

  function handleAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit || !id) return;
    setLoading(true);
    try {
      const res = await submitCheckin(id, { answers });
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
        <PageHeader title="체크인 완료" small />
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
          <Button onClick={() => navigate("/dashboard", { replace: true })}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="screen">
        <PageHeader title="주간 체크인" onBack small />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHeader title="주간 체크인" onBack small />

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

        {questions.map((q) => (
          <QuestionCard key={q.key} title={q.title}>
            <SelectionGroup
              options={q.options.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              selected={answers[q.key] ?? null}
              onChange={(val) => handleAnswer(q.key, val)}
            />
          </QuestionCard>
        ))}
      </div>

      <BottomAction>
        <Button
          disabled={!canSubmit}
          loading={loading}
          loadingText="분석 중..."
          onClick={handleSubmit}
        >
          체크인 완료
        </Button>
      </BottomAction>
    </div>
  );
}

function QuestionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card style={{ margin: "0 16px 10px" }}>
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
    </Card>
  );
}
