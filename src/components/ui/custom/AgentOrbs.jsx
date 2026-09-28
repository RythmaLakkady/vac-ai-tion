import { useEffect, useState, useMemo } from "react";
import { Target, Map as MapIcon, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENTS = [
  {
    id: "vibe-matcher",
    label: "Vibe Matcher",
    icon: <Target className="w-5 h-5" />,
    color: "#8b5cf6",    // violet-500
    glowColor: "rgba(139, 92, 246, 0.5)",
    x: 50, y: 15,
  },
  {
    id: "planner",
    label: "Planner",
    icon: <MapIcon className="w-5 h-5" />,
    color: "#10b981",    // emerald-500
    glowColor: "rgba(16, 185, 129, 0.5)",
    x: 15, y: 80,
  },
  {
    id: "critic",
    label: "Critic",
    icon: <Search className="w-5 h-5" />,
    color: "#f59e0b",    // amber-500
    glowColor: "rgba(245, 158, 11, 0.5)",
    x: 85, y: 80,
  },
];

const CONNECTIONS = [
  { from: "vibe-matcher", to: "planner" },
  { from: "planner", to: "critic" },
  { from: "critic", to: "vibe-matcher" }, // Close the triangle visually
];

export default function AgentOrbs({ logs = [], status = "pending" }) {
  const [activeAgent, setActiveAgent] = useState(null);

  useEffect(() => {
    if (logs.length === 0) {
      setActiveAgent(null);
      return;
    }
    const latest = logs[logs.length - 1];
    setActiveAgent(latest.agent);
  }, [logs]);

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
    <div className="w-full max-w-lg mx-auto relative h-[300px]">
      {/* Background SVG Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="activeLink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map((conn) => {
          const from = getAgent(conn.from);
          const to = getAgent(conn.to);
          if (!from || !to) return null;
          const key = `${conn.from}->${conn.to}`;
          const isActive = activeConnections.has(key);
          
          return (
            <motion.line
              key={key}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? "url(#activeLink)" : "#e5e7eb"}
              strokeWidth={isActive ? "0.6" : "0.2"}
              strokeDasharray={isActive ? "none" : "2 2"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: isActive ? 1 : 0.5, 
                opacity: isActive ? 0.8 : 0.3 
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="dark:stroke-gray-800"
            />
          );
        })}
      </svg>

      {/* Center status core */}
      <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
        <motion.div
          animate={{
            rotate: status === "processing" ? 360 : 0,
            scale: status === "processing" ? [1, 1.1, 1] : 1,
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-32 h-32 rounded-full border border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center opacity-40"
        >
          {status === "processing" && (
            <Sparkles className="w-8 h-8 text-gray-400 animate-pulse" />
          )}
        </motion.div>
      </div>

      {/* Agents */}
      {AGENTS.map((agent, i) => {
        const isActive = activeAgent === agent.id;
        const logCount = logs.filter((l) => l.agent === agent.id).length;

        return (
          <motion.div
            key={agent.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: "-50%", 
              y: "-50%" 
            }}
            transition={{ 
              delay: i * 0.15, 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
          >
            {/* Float animation wrapper */}
            <motion.div
              animate={{
                y: isActive ? [0, -10, 0] : [0, -4, 0],
              }}
              transition={{
                duration: isActive ? 2 : 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex flex-col items-center"
            >
              {/* Outer Glow */}
              <motion.div
                animate={{
                  scale: isActive ? [1, 1.4, 1] : 1,
                  opacity: isActive ? [0.4, 0.7, 0.4] : 0,
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: agent.color, zIndex: 0 }}
              />

              {/* Orb Body */}
              <motion.div
                className={`relative z-10 rounded-full flex items-center justify-center border-2 shadow-2xl backdrop-blur-md overflow-hidden ${isActive ? 'ring-4 ring-white/30 dark:ring-black/30' : ''}`}
                style={{
                  width: isActive ? "68px" : "56px",
                  height: isActive ? "68px" : "56px",
                  background: `linear-gradient(135deg, ${agent.color}dd, ${agent.color}88)`,
                  borderColor: agent.color,
                }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Icon wrapper */}
                <div className={`text-white drop-shadow-md transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100 opacity-80'}`}>
                  {agent.icon}
                </div>
              </motion.div>

              {/* Activity Badge */}
              <AnimatePresence>
                {logCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white border-2 border-white dark:border-gray-950 shadow-md"
                    style={{ backgroundColor: agent.color, zIndex: 20 }}
                  >
                    {logCount}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Label */}
              <motion.div
                className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap shadow-sm backdrop-blur-md transition-colors duration-300"
                style={{ 
                  backgroundColor: isActive ? `${agent.color}15` : 'var(--background)',
                  color: isActive ? agent.color : 'var(--muted-foreground)',
                  border: `1px solid ${isActive ? `${agent.color}40` : 'var(--border)'}`
                }}
                animate={{
                  y: isActive ? 0 : -2,
                }}
              >
                {agent.label}
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
