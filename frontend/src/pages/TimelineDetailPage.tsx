import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getTimeline,
  deleteAbstinence,
  type TimelineResponse,
  type TimelineStage,
  type TimelineEvent,
} from "../api/abstinence";
import { PageHeader, LoadingState, ProgressBar } from "../components/ui";

export default function TimelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(-1);
  const stageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTimeline(id)
      .then((res) => {
        setData(res);
        const idx = res.stages.findIndex((s) => s.status === "current");
        if (idx >= 0) {
          setExpandedStages(new Set([idx]));
          setCurrentStageIdx(idx);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (currentStageIdx >= 0 && !loading) {
      const el = stageRefs.current.get(currentStageIdx);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "center" });
      }
    }
  }, [currentStageIdx, loading]);

  async function handleDelete() {
    if (!id) return;
    if (!confirm(`"${data?.abstinence.label}" 디톡스를 삭제하시겠습니까?\n모든 타임라인과 체크인 기록이 함께 삭제됩니다.`)) {
      return;
    }
    try {
      await deleteAbstinence(id);
      navigate("/dashboard", { replace: true });
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

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
      <>
        <PageHeader title="타임라인" />
        <LoadingState />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`${data.abstinence.label} 타임라인`}
        onBack
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>D+{data.abstinence.current_day}</span>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  fontSize: 18,
                  color: "var(--gray-500)",
                  lineHeight: 1,
                }}
              >
                {"\u22EF"}
              </button>
              {menuOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 20 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => { setMenuOpen(false); handleDelete(); }}
                      style={{ color: "var(--red)" }}
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
        small
      />

      {/* Content */}
      <div style={{ padding: "8px 0 24px" }}>
        {data.stages.map((stage, idx) => (
          <StageAccordion
            key={idx}
            ref={(el) => { if (el) stageRefs.current.set(idx, el); }}
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
    </>
  );
}

function StageAccordion({
  ref,
  stage,
  expanded,
  onToggle,
  currentDay,
}: {
  ref?: React.Ref<HTMLDivElement>;
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
      ref={ref}
      style={{
        margin: "0 16px 8px",
        background: "var(--white)",
        borderRadius: 14,
        overflow: "hidden",
        ...(stage.status === "current" ? {
          border: "2px solid var(--primary)",
          boxShadow: "0 0 0 4px var(--primary-light)",
        } : {}),
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
                <span>{stage.stage}단계 진행중</span>
                <span>{Math.max(stage.day_to - currentDay + 1, 0)}일 후 다음 단계</span>
              </div>
              <div style={{ marginBottom: 18 }}>
                <ProgressBar percent={progress} />
              </div>
            </>
          )}

          {(stage.status === "upcoming" || stage.status === "completed") && (!stage.events || stage.events.length === 0) && (
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

      {!expanded && event.fact.length > 60 && (
        <div style={{ textAlign: "center", marginTop: 4, color: "var(--gray-300)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      )}

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

      {expanded && event.fact.length > 60 && (
        <div style={{ textAlign: "center", marginTop: 4, color: "var(--gray-300)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15" /></svg>
        </div>
      )}
    </div>
  );
}
