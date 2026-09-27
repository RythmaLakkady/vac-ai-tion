import { Bot } from "lucide-react";
import TravelFactsCarousel from "@/components/ui/custom/TravelFactsCarousel";
import AgentOrbs from "@/components/ui/custom/AgentOrbs";
import AgentTerminal from "@/components/ui/custom/AgentTerminal";

export default function TripGenerationProgress({ destination, agentLogs, agentStatus }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber/5 via-transparent to-coral/5 p-6 pt-24 md:p-12 md:pt-28 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold text-ink flex items-center gap-3">
            <Bot className="w-8 h-8 text-amber animate-pulse" /> Agent Swarm Active
          </h2>
          <span className="text-sm font-bold tracking-widest text-ink/40 uppercase animate-pulse">Processing...</span>
        </div>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[600px]">
          {/* Left Column: Carousel */}
          <div className="w-full h-full min-h-[400px]">
            <TravelFactsCarousel destination={destination} />
          </div>

          {/* Right Column: Agents */}
          <div className="w-full flex flex-col gap-6">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8 flex items-center justify-center relative overflow-hidden h-[280px]">
               <AgentOrbs logs={agentLogs} status={agentStatus} />
            </div>
            
            <div className="flex-1 bg-gray-950/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col">
               <AgentTerminal logs={agentLogs} status={agentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
