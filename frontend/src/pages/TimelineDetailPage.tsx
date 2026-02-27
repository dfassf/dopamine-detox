import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getTimeline,
  type TimelineResponse,
  type TimelineStage,
  type TimelineEvent,
} from "../api/abstinence";

export default function TimelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    getTimeline(Number(id))
      .then((res) => {
        setData(res);
        // 현재 단계 자동 펼침
        const currentIdx = res.stages.findIndex((s) => s.status === "current");
        if (currentIdx >= 0) {
          setExpandedStages(new Set([currentIdx]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function toggleStage(idx: number) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  if (loading || !data) {
    return (
      <div className="screen">
        <div style={{ padding: 24, textAlign: "center", color: "var(--gray-400)" }}>
          불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--gray">
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
          <h1 style={{ fontSize: 18 }}>{data.abstinence.label} 타임라인</h1>
        </div>
        <div className="header-right">D+{data.abstinence.current_day}</div>
      </div>

      {/* Content */}
      <div className="screen-content" style={{ padding: "8px 0 24px" }}>
        {data.stages.map((stage, idx) => (
          <StageAccordion
            key={idx}
            stage={stage}
            expanded={expandedStages.has(idx)}
            onToggle={() => toggleStage(idx)}
            currentDay={data.abstinence.current_day}
          />
        ))}

        {/* Disclaimer */}
        <div
          style={{
            margin: "16px 16px 0",
            padding: "12px 16px",
            background: "var(--gray-100)",
            borderRadius: 10,
            fontSize: 11,
            color: "var(--gray-400)",
            lineHeight: 1.6,
          }}
        >
          이 정보는 일반적인 건강 정보이며, 의학적 진단이나 처방이 아닙니다. 개인차가 있을 수 있으며, 건강 관련 결정은 전문의와 상담하세요.
        </div>
      </div>
    </div>
  );
}

function StageAccordion({
  stage,
  expanded,
  onToggle,
  currentDay,
}: {
  stage: TimelineStage;
  expanded: boolean;
  onToggle: () => void;
  currentDay: number;
}) {
  const badgeColor =
    stage.status === "upcoming"
      ? { bg: "var(--gray-200)", color: "var(--gray-500)" }
      : { bg: "var(--primary)", color: "var(--white)" };

  const totalDays = stage.day_to - stage.day_from + 1;
  const daysIn = Math.min(Math.max(currentDay - stage.day_from, 0), totalDays);
  const progress = totalDays > 0 ? (daysIn / totalDays) * 100 : 0;

  return (
    <div
      style={{
        margin: "0 16px 8px",
        background: "var(--white)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
            background: badgeColor.bg,
            color: badgeColor.color,
          }}
        >
          {stage.status === "completed" ? "\u2713" : stage.stage}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-900)" }}>
            {stage.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>
            D+{stage.day_from} ~ D+{stage.day_to}
          </div>
        </div>
        {stage.status === "completed" && (
          <span style={{ color: "var(--primary)", fontSize: 18 }}>{"\u2713"}</span>
        )}
        <span
          style={{
            color: "var(--gray-300)",
            fontSize: 14,
            transform: expanded ? "rotate(90deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          {"\u203A"}
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div style={{ padding: "0 18px 18px" }}>
          {stage.status === "current" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "var(--gray-500)",
                  marginBottom: 8,
                }}
              >
                <span>
                  {stage.stage}단계 진행중
                </span>
                <span>
                  {Math.max(stage.day_to - currentDay + 1, 0)}일 후 다음 단계
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "var(--gray-100)",
                  borderRadius: 3,
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--primary)",
                    borderRadius: 3,
                    width: `${Math.min(progress, 100)}%`,
                  }}
                />
              </div>
            </>
          )}

          {stage.status === "upcoming" && !stage.events && (
            <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.6 }}>
              {stage.summary}
            </div>
          )}

          {stage.events && stage.events.length > 0 && (
            <div style={{ position: "relative", paddingLeft: 20 }}>
              {/* Timeline line */}
              <div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 4,
                  bottom: 4,
                  width: 2,
                  background: "var(--gray-200)",
                }}
              />

              {stage.events.map((event, idx) => (
                <EventItem key={idx} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventItem({ event }: { event: TimelineEvent }) {
  const [expanded, setExpanded] = useState(false);

  const dotColor =
    event.status === "past"
      ? "var(--primary)"
      : event.status === "current"
        ? "var(--primary)"
        : "var(--gray-300)";

  const dotSize = event.status === "current" ? 14 : 10;

  return (
    <div
      style={{ marginBottom: 18, position: "relative", cursor: "pointer" }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Dot */}
      <div
        style={{
          position: "absolute",
          left: -20 + 7 - dotSize / 2 + 1,
          top: 4,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          border: event.status === "current" ? "2px solid var(--primary-light)" : "none",
        }}
      />

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: event.status === "upcoming" ? "var(--gray-400)" : "var(--primary-dark)",
          marginBottom: 4,
        }}
      >
        D+{event.day}
        {event.status === "current" && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              background: "var(--primary-light)",
              color: "var(--primary-dark)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            현재
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 13,
          color: event.status === "upcoming" ? "var(--gray-400)" : "var(--gray-900)",
          lineHeight: 1.6,
        }}
      >
        {expanded ? event.fact : event.fact.length > 60 ? event.fact.slice(0, 60) + "..." : event.fact}
      </div>

      {expanded && event.feeling && (
        <div
          style={{
            fontSize: 12,
            color: "var(--gray-500)",
            lineHeight: 1.6,
            marginTop: 8,
          }}
        >
          {event.feeling}
        </div>
      )}

      {expanded && event.action && (
        <div
          style={{
            fontSize: 12,
            color: "var(--primary-dark)",
            lineHeight: 1.5,
            background: "var(--primary-light)",
            padding: "8px 10px",
            borderRadius: 6,
            marginTop: 8,
          }}
        >
          {event.action}
        </div>
      )}
    </div>
  );
}
