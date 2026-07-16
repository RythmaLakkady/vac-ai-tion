import { useState, useEffect, useRef } from "react";
import { Settings, Target, Map as MapIcon, Search } from "lucide-react";

const AGENT_COLORS = {
  "system": { bg: "bg-slate-800", text: "text-slate-300", icon: <Settings className="w-3 h-3 inline-block mr-1" />, glow: "shadow-slate-500/20" },
  "vibe-matcher": { bg: "bg-purple-900/80", text: "text-purple-300", icon: <Target className="w-3 h-3 inline-block mr-1" />, glow: "shadow-purple-500/20" },
  "planner": { bg: "bg-emerald-900/80", text: "text-emerald-300", icon: <MapIcon className="w-3 h-3 inline-block mr-1" />, glow: "shadow-emerald-500/20" },
  "critic": { bg: "bg-amber-900/80", text: "text-amber-300", icon: <Search className="w-3 h-3 inline-block mr-1" />, glow: "shadow-amber-500/20" },
};

function getAgentStyle(agent) {
  return AGENT_COLORS[agent] || AGENT_COLORS["system"];
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AgentTerminal({ logs = [], status = "pending" }) {
  const scrollRef = useRef(null);
  const [showCursor, setShowCursor] = useState(true);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Blinking cursor
  useEffect(() => {
    if (status === "completed" || status === "failed") {
      setShowCursor(false);
      return;
    }
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, [status]);

  const isRunning = status === "pending" || status === "processing";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Terminal header */}
      <div className="flex items-center gap-2 bg-gray-900 rounded-t-xl px-4 py-2.5 border border-gray-700 border-b-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="ml-3 text-gray-400 text-xs font-mono tracking-wider">
          AGENT SWARM — {status.toUpperCase()}
        </span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-mono">LIVE</span>
          </span>
        )}
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="bg-gray-950 border border-gray-700 border-t-0 rounded-b-xl p-4 
                   max-h-80 overflow-y-auto font-mono text-sm space-y-2
                   scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(122, 185, 179, 0.03) 0%, transparent 60%)",
        }}
      >
        {logs.length === 0 && (
          <p className="text-gray-600 italic">Waiting for agents to start...</p>
        )}

        {logs.map((log, i) => {
          const style = getAgentStyle(log.agent);
          return (
            <div
              key={i}
              className={`flex items-start gap-2 animate-fadeIn`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-gray-600 text-xs mt-0.5 w-16 shrink-0">
                {formatTime(log.timestamp)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text} 
                            shadow-md ${style.glow} shrink-0 font-semibold uppercase tracking-wide`}
              >
                {style.icon} {log.agent}
              </span>
              <span className="text-gray-300 leading-relaxed">{log.message}</span>
            </div>
          );
        })}

        {/* Blinking cursor */}
        {isRunning && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-600 text-xs w-16" />
            <span
              className={`inline-block w-2 h-4 bg-green-400 ${
                showCursor ? "opacity-100" : "opacity-0"
              } transition-opacity duration-100`}
            />
          </div>
        )}

        {/* Status footer */}
        {status === "completed" && (
          <div className="mt-3 pt-3 border-t border-gray-800 text-center">
            <span className="text-green-400 font-semibold text-xs tracking-wider">
              ✅ ALL AGENTS COMPLETED SUCCESSFULLY
            </span>
          </div>
        )}
        {status === "failed" && (
          <div className="mt-3 pt-3 border-t border-gray-800 text-center">
            <span className="text-red-400 font-semibold text-xs tracking-wider">
              ❌ AGENT PIPELINE FAILED
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
