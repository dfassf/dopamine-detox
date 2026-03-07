import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getTimeline,
  deleteAbstinence,
  type TimelineResponse,
} from "../api/abstinence";
import { LoadingState, PageHeader } from "../components/ui";
import { StageAccordion } from "./timeline-detail/StageAccordion";

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
    if (!id) {
      return;
    }

    getTimeline(id)
      .then((res) => {
        setData(res);
        const idx = res.stages.findIndex((stage) => stage.status === "current");
        if (idx >= 0) {
          setExpandedStages(new Set([idx]));
          setCurrentStageIdx(idx);
        }
      })
      .catch(() => {
        // noop
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (currentStageIdx < 0 || loading) {
      return;
    }

    const currentRef = stageRefs.current.get(currentStageIdx);
    currentRef?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [currentStageIdx, loading]);

  async function handleDelete() {
    if (!id) {
      return;
    }

    if (
      !confirm(
        `"${data?.abstinence.label}" 디톡스를 삭제하시겠습니까?\n모든 타임라인과 체크인 기록이 함께 삭제됩니다.`
      )
    ) {
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
                onClick={() => setMenuOpen((prev) => !prev)}
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
                      onClick={() => {
                        setMenuOpen(false);
                        void handleDelete();
                      }}
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

      <div style={{ padding: "8px 0 24px" }}>
        {data.stages.map((stage, idx) => (
          <StageAccordion
            key={idx}
            stageRef={(el) => {
              if (el) {
                stageRefs.current.set(idx, el);
              }
            }}
            stage={stage}
            expanded={expandedStages.has(idx)}
            onToggle={() => toggleStage(idx)}
            currentDay={data.abstinence.current_day}
          />
        ))}

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
          이 정보는 일반적인 건강 정보이며, 의학적 진단이나 처방이 아닙니다. 개인차가 있을
          수 있으며, 건강 관련 결정은 전문의와 상담하세요.
        </div>
      </div>
    </>
  );
}
