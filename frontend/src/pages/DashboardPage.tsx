import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getDashboard,
  type DashboardAbstinence,
  type DashboardResponse,
  type TodayMessage,
} from "../api/dashboard";
import {
  PageHeader,
  Card,
  Button,
  LoadingState,
  EmptyState,
  ProgressBar,
} from "../components/ui";

const TYPE_EMOJI: Record<string, string> = {
  alcohol: "\u{1F37A}",
  smoking: "\u{1F6AC}",
  diet: "\u{1F957}",
};

const TYPE_BG: Record<string, string> = {
  alcohol: "#fef3c7",
  smoking: "#fee2e2",
  diet: "#dcfce7",
};

const TYPE_LABEL: Record<string, string> = {
  alcohol: "금주",
  smoking: "금연",
  diet: "식단",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  const hasAbstinences = data && data.abstinences.length > 0;

  return (
    <>
      <PageHeader title="도파민 디톡스" />

      {!hasAbstinences ? (
        <EmptyState
          emoji={"\u{1F331}"}
          message="아직 시작한 디톡스가 없어요"
          actionLabel="디톡스 시작하기"
          onAction={() => navigate("/abstinence/new")}
        />
      ) : (
        <div style={{ paddingBottom: 16 }}>
          {data!.today_messages.length > 0 && (
            <TodayMessageCard msg={data!.today_messages[0]} />
          )}

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--gray-500)",
              margin: "16px 20px 8px",
              letterSpacing: 0.5,
            }}
          >
            내 디톡스
          </div>

          {data!.abstinences.map((a) => (
            <AbstinenceCard key={a.id} item={a} />
          ))}

          {data!.has_pending_checkin && data!.abstinences.length > 0 && (
            <Card
              style={{
                margin: "0 16px 12px",
                border: "1.5px dashed var(--primary)",
              }}
            >
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--gray-900)",
                  marginBottom: 6,
                }}
              >
                {"\u{1F4CB}"} 주간 체크인 도착!
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--gray-500)",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                이번 주 상태를 알려주시면 타임라인을 업데이트해요
              </p>
              <Button
                style={{ fontSize: 13, padding: "10px 20px" }}
                onClick={() =>
                  navigate(`/abstinence/${data!.abstinences[0].id}/checkin`)
                }
              >
                체크인하기
              </Button>
            </Card>
          )}

        </div>
      )}
    </>
  );
}

function TodayMessageCard({ msg }: { msg: TodayMessage }) {
  const label = TYPE_LABEL[msg.abstinence_type] || msg.abstinence_type;
  return (
    <Card
      style={{
        margin: "12px 16px",
        borderLeft: "4px solid var(--primary)",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "var(--primary-light)",
          color: "var(--primary-dark)",
          fontSize: 11,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 6,
          marginBottom: 12,
        }}
      >
        D+{msg.current_day} {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--gray-900)",
          lineHeight: 1.6,
          marginBottom: 10,
        }}
      >
        {msg.fact}
      </div>
      {msg.feeling && (
        <div
          style={{
            fontSize: 13,
            color: "var(--gray-500)",
            lineHeight: 1.6,
            marginBottom: 10,
          }}
        >
          {msg.feeling}
        </div>
      )}
      {msg.action && (
        <div
          style={{
            fontSize: 13,
            color: "var(--primary-dark)",
            lineHeight: 1.5,
            background: "var(--primary-light)",
            padding: "10px 12px",
            borderRadius: 8,
          }}
        >
          {msg.action}
        </div>
      )}
    </Card>
  );
}

function AbstinenceCard({ item }: { item: DashboardAbstinence }) {
  const navigate = useNavigate();
  const emoji = TYPE_EMOJI[item.type] || "\u{2728}";
  const bg = TYPE_BG[item.type] || "var(--primary-light)";

  const progress =
    item.current_stage.total_stages > 0
      ? (item.current_stage.stage / item.current_stage.total_stages) * 100
      : 0;

  return (
    <Card onClick={() => navigate(`/timeline/${item.id}`)} style={{ margin: "0 16px 10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              background: bg,
            }}
          >
            {emoji}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>
              {item.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
              D+{item.current_day}
            </div>
          </div>
        </div>
        <span style={{ color: "var(--gray-300)", fontSize: 20 }}>{"\u203A"}</span>
      </div>

      <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 6 }}>
        {item.current_stage.stage}단계: {item.current_stage.name} ({item.current_stage.total_stages}중{" "}
        {item.current_stage.stage})
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gray-600)", marginBottom: 8 }}>
        <span>진행중</span>
        <span>{item.current_stage.days_to_next_stage}일 후 다음 단계</span>
      </div>
      <ProgressBar percent={progress} height={8} />
    </Card>
  );
}
