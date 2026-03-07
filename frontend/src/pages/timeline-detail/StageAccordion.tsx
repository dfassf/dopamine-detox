import type { Ref } from "react";
import type { TimelineStage } from "../../api/abstinence";
import { ProgressBar } from "../../components/ui";
import { EventItem } from "./EventItem";

interface StageAccordionProps {
  stageRef?: Ref<HTMLDivElement>;
  stage: TimelineStage;
  expanded: boolean;
  onToggle: () => void;
  currentDay: number;
}

export function StageAccordion({
  stageRef,
  stage,
  expanded,
  onToggle,
  currentDay,
}: StageAccordionProps) {
  const badgeColor =
    stage.status === "upcoming"
      ? { bg: "var(--gray-200)", color: "var(--gray-500)" }
      : { bg: "var(--primary)", color: "var(--white)" };

  const totalDays = stage.day_to - stage.day_from + 1;
  const daysIn = Math.min(Math.max(currentDay - stage.day_from, 0), totalDays);
  const progress = totalDays > 0 ? (daysIn / totalDays) * 100 : 0;

  return (
    <div
      ref={stageRef}
      style={{
        margin: "0 16px 8px",
        background: "var(--white)",
        borderRadius: 14,
        overflow: "hidden",
        ...(stage.status === "current"
          ? {
              border: "2px solid var(--primary)",
              boxShadow: "0 0 0 4px var(--primary-light)",
            }
          : {}),
      }}
    >
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

          {(stage.status === "upcoming" || stage.status === "completed") &&
            (!stage.events || stage.events.length === 0) && (
              <div style={{ fontSize: 13, color: "var(--gray-500)", lineHeight: 1.6 }}>
                {stage.summary}
              </div>
            )}

          {stage.events && stage.events.length > 0 && (
            <div style={{ position: "relative", paddingLeft: 20 }}>
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
                <EventItem key={`${event.day}-${idx}`} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
