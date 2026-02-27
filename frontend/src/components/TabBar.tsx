import { useLocation, useNavigate } from "react-router";

const TABS = [
  {
    key: "home",
    label: "홈",
    path: "/dashboard",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? "var(--primary)" : "none"}
        stroke={active ? "var(--primary)" : "var(--gray-400)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "timeline",
    label: "타임라인",
    path: "/timeline",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "var(--primary)" : "var(--gray-400)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    key: "mypage",
    label: "마이",
    path: "/mypage",
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "var(--primary)" : "var(--gray-400)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
] as const;

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: 83,
        background: "var(--white)",
        borderTop: "1px solid var(--gray-100)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: 10,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              width: 72,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {tab.icon(active)}
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--primary)" : "var(--gray-400)",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
