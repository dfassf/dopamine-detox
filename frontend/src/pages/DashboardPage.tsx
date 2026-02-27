import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getDashboard,
  type DashboardAbstinence,
  type DashboardResponse,
  type TodayMessage,
} from "../api/dashboard";

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
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--gray-400)" }}>
        불러오는 중...
      </div>
    );
  }

  const hasAbstinences = data && data.abstinences.length > 0;

  return (
    <>
      {/* Header */}
      <div className="app-header">
        <h1>restrainter</h1>
      </div>

      {!hasAbstinences ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F331}"}</div>
          <p
            style={{
              fontSize: 16,
              color: "var(--gray-500)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            아직 시작한 금욕이 없어요
          </p>
          <button
            className="btn btn-primary"
            style={{ maxWidth: 240 }}
            onClick={() => navigate("/abstinence/new")}
          >
            금욕 시작하기
          </button>
        </div>
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
            내 금욕
          </div>

          {data!.abstinences.map((a) => (
            <AbstinenceCard key={a.id} item={a} />
          ))}

          {data!.has_pending_checkin && data!.abstinences.length > 0 && (
            <div
              style={{
                background: "var(--white)",
                borderRadius: 16,
                margin: "0 16px 12px",
                padding: "18px 20px",
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
              <button
                className="btn btn-primary"
                style={{ fontSize: 13, padding: "10px 20px" }}
                onClick={() =>
                  navigate(`/abstinence/${data!.abstinences[0].id}/checkin`)
                }
              >
                체크인하기
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/abstinence/new")}
            style={{
              display: "block",
              width: "calc(100% - 32px)",
              margin: "4px 16px 16px",
              padding: 14,
              border: "1.5px dashed var(--gray-300)",
              borderRadius: 12,
              textAlign: "center",
              fontSize: 14,
              color: "var(--gray-400)",
              fontWeight: 500,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            + 금욕 추가
          </button>
        </div>
      )}
    </>
  );
}

function TodayMessageCard({ msg }: { msg: TodayMessage }) {
  const label = TYPE_LABEL[msg.abstinence_type] || msg.abstinence_type;
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        margin: "12px 16px",
        padding: 20,
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
    </div>
  );
}

function AbstinenceCard({ item }: { item: DashboardAbstinence }) {
  const navigate = useNavigate();
  const emoji = TYPE_EMOJI[item.type] || "\u{2728}";
  const bg = TYPE_BG[item.type] || "var(--primary-light)";

  return (
    <button
      onClick={() => navigate(`/timeline/${item.id}`)}
      style={{
        display: "block",
        width: "calc(100% - 32px)",
        background: "var(--white)",
        borderRadius: 16,
        margin: "0 16px 10px",
        padding: "18px 20px",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
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

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--gray-600)",
          }}
        >
          <span>진행중</span>
          <span>{item.current_stage.days_to_next_stage}일 후 다음 단계</span>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--gray-100)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--primary)",
              borderRadius: 4,
              width: `${
                item.current_stage.total_stages > 0
                  ? (item.current_stage.stage / item.current_stage.total_stages) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>
    </button>
  );
}
