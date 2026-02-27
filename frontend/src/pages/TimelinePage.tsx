import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listAbstinences, type AbstinenceListItem } from "../api/abstinence";

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

export default function TimelinePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AbstinenceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAbstinences()
      .then((data) => {
        setItems(data);
        // 금욕이 1개면 바로 상세로 이동
        if (data.length === 1) {
          navigate(`/timeline/${data[0].id}`, { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <>
        <div className="app-header">
          <h1>타임라인</h1>
        </div>
        <div style={{ padding: 24, textAlign: "center", color: "var(--gray-400)" }}>
          불러오는 중...
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="app-header">
          <h1>타임라인</h1>
        </div>
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
          <p style={{ fontSize: 15, color: "var(--gray-500)", marginBottom: 16 }}>
            아직 등록된 금욕이 없어요
          </p>
          <button
            className="btn btn-primary"
            style={{ maxWidth: 200 }}
            onClick={() => navigate("/abstinence/new")}
          >
            금욕 시작하기
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-header">
        <h1>타임라인</h1>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {items.map((item) => {
          const emoji = TYPE_EMOJI[item.type] || "\u{2728}";
          const bg = TYPE_BG[item.type] || "var(--primary-light)";
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/timeline/${item.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                background: "var(--white)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 10,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  background: bg,
                  flexShrink: 0,
                }}
              >
                {emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
                  {item.start_date} 시작
                </div>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                D+{item.current_day}
              </div>
              <span style={{ color: "var(--gray-300)", fontSize: 18 }}>{"\u203A"}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
