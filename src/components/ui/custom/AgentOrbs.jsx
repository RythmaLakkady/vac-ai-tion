import { useEffect, useState, useMemo } from "react";
import { Target, Map as MapIcon, Search } from "lucide-react";

const AGENTS = [
  {
    id: "vibe-matcher",
    label: "Vibe Matcher",
    icon: <Target className="w-5 h-5 text-purple-600" />,
    color: "#a855f7",    // purple-500
    glowColor: "rgba(168, 85, 247, 0.4)",
    x: 50, y: 20,
  },
  {
    id: "planner",
    label: "Planner",
    icon: <MapIcon className="w-5 h-5 text-emerald-600" />,
    color: "#10b981",    // emerald-500
    glowColor: "rgba(16, 185, 129, 0.4)",
    x: 20, y: 75,
  },
  {
    id: "critic",
    label: "Critic",
    icon: <Search className="w-5 h-5 text-amber-600" />,
    color: "#f59e0b",    // amber-500
    glowColor: "rgba(245, 158, 11, 0.4)",
    x: 80, y: 75,
  },
];

// Lines connecting agents
const CONNECTIONS = [
  { from: "vibe-matcher", to: "planner" },
  { from: "planner", to: "critic" },
  { from: "critic", to: "planner" },
];

export default function AgentOrbs({ logs = [], status = "pending" }) {
  const [activeAgent, setActiveAgent] = useState(null);

  // Determine which agent is currently active based on latest log
  useEffect(() => {
    if (logs.length === 0) {
      setActiveAgent(null);
      return;
    }
    const latest = logs[logs.length - 1];
    setActiveAgent(latest.agent);
  }, [logs]);

  // Determine which connections are active
  const activeConnections = useMemo(() => {
    if (logs.length < 2) return new Set();
    const active = new Set();
    for (let i = 1; i < logs.length; i++) {
      const from = logs[i - 1].agent;
      const to = logs[i].agent;
      if (from !== to) {
        active.add(`${from}->${to}`);
      }
    }
    return active;
  }, [logs]);

  const getAgent = (id) => AGENTS.find((a) => a.id === id);

  return (
    <div className="w-full max-w-md mx-auto relative" style={{ height: "220px" }}>
      {/* SVG for connection lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7AB9B3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fd9c7e" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map((conn) => {
          const from = getAgent(conn.from);
          const to = getAgent(conn.to);
          if (!from || !to) return null;
          const key = `${conn.from}->${conn.to}`;
          const isActive = activeConnections.has(key);
          return (
            <line
              key={key}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? "url(#lineGrad)" : "#374151"}
              strokeWidth={isActive ? "0.5" : "0.3"}
              strokeDasharray={isActive ? "none" : "2 2"}
              style={{
                transition: "all 0.5s ease",
                filter: isActive ? "drop-shadow(0 0 3px rgba(122,185,179,0.5))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Agent orbs */}
      {AGENTS.map((agent) => {
        const isActive = activeAgent === agent.id;
        const isCompleted = status === "completed";
        const logCount = logs.filter((l) => l.agent === agent.id).length;

        return (
          <div
            key={agent.id}
            className="absolute flex flex-col items-center transition-all duration-500"
            style={{
              left: `${agent.x}%`,
              top: `${agent.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            {/* Outer glow ring */}
            <div
              className={`rounded-full flex items-center justify-center transition-all duration-500`}
              style={{
                width: isActive ? "64px" : "52px",
                height: isActive ? "64px" : "52px",
                background: `radial-gradient(circle, ${agent.glowColor} 0%, transparent 70%)`,
                boxShadow: isActive
                  ? `0 0 20px ${agent.glowColor}, 0 0 40px ${agent.glowColor}`
                  : "none",
              }}
            >
              {/* Inner orb */}
              <div
                className={`rounded-full flex items-center justify-center text-xl
                           border-2 transition-all duration-300 ${
                             isActive ? "scale-110" : "scale-100"
                           }`}
                style={{
                  width: "44px",
                  height: "44px",
                  background: `linear-gradient(135deg, ${agent.color}22, ${agent.color}44)`,
                  borderColor: isActive ? agent.color : "#374151",
                  animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
                }}
              >
                {agent.icon}
              </div>
            </div>

            {/* Label */}
            <span
              className="mt-1 text-xs font-mono tracking-wide transition-colors duration-300"
              style={{ color: isActive ? agent.color : "#6b7280" }}
            >
              {agent.label}
            </span>

            {/* Activity badge */}
            {logCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold
                           flex items-center justify-center text-white"
                style={{ backgroundColor: agent.color }}
              >
                {logCount}
              </span>
            )}
          </div>
        );
      })}

      {/* Center status indicator */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        {status === "processing" && (
          <div
            className="w-16 h-16 rounded-full border border-dashed border-gray-600 animate-spin"
            style={{ animationDuration: "8s" }}
          />
        )}
      </div>
    </div>
  );
}
