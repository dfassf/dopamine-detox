import { useState } from "react";
import type { TimelineEvent } from "../../api/abstinence";

interface EventItemProps {
  event: TimelineEvent;
}

export function EventItem({ event }: EventItemProps) {
  const [expanded, setExpanded] = useState(false);

  const dotColor =
    event.status === "upcoming" ? "var(--gray-300)" : "var(--primary)";

  const dotSize = event.status === "current" ? 14 : 10;

  return (
    <div
      style={{ marginBottom: 18, position: "relative", cursor: "pointer" }}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div
        style={{
          position: "absolute",
          left: -20 + 7 - dotSize / 2 + 1,
          top: 4,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          border:
            event.status === "current"
              ? "2px solid var(--primary-light)"
              : "none",
        }}
      />

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color:
            event.status === "upcoming"
              ? "var(--gray-400)"
              : "var(--primary-dark)",
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
          color:
            event.status === "upcoming" ? "var(--gray-400)" : "var(--gray-900)",
          lineHeight: 1.6,
        }}
      >
        {expanded
          ? event.fact
          : event.fact.length > 60
            ? `${event.fact.slice(0, 60)}...`
            : event.fact}
      </div>

      {!expanded && event.fact.length > 60 && (
        <div style={{ textAlign: "center", marginTop: 4, color: "var(--gray-300)" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 15 12 9 18 15" />
          </svg>
        </div>
      )}
    </div>
  );
}
