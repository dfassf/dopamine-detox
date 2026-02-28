import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listAbstinences, type AbstinenceListItem } from "../api/abstinence";
import { PageHeader, Card, Button, LoadingState, EmptyState } from "../components/ui";

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
        <PageHeader title="타임라인" />
        <LoadingState />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="타임라인" />
        <EmptyState
          message="아직 등록된 디톡스가 없어요"
          actionLabel="디톡스 시작하기"
          onAction={() => navigate("/abstinence/new")}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="타임라인" />
      <div style={{ padding: "0 16px 16px" }}>
        {items.map((item) => {
          const emoji = TYPE_EMOJI[item.type] || "\u{2728}";
          const bg = TYPE_BG[item.type] || "var(--primary-light)";
          return (
            <Card
              key={item.id}
              onClick={() => navigate(`/timeline/${item.id}`)}
              padding="compact"
              style={{ marginBottom: 10 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
              </div>
            </Card>
          );
        })}

        <Button onClick={() => navigate("/abstinence/new")}>
          + 새로 시작하기
        </Button>
      </div>
    </>
  );
}
