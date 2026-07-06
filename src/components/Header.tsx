import React from "react";
import { ShieldCheck, UserCheck, RefreshCw, Trophy, Cpu, Users } from "lucide-react";

interface HeaderProps {
  currentMode: "fan" | "ops";
  setCurrentMode: (mode: "fan" | "ops") => void;
  activeMatch: string;
  spectatorsCount: number;
  capacity: number;
  isSimulating: boolean;
  onResetSimulation: () => void;
  alertCount: number;
}

export default function Header({
  currentMode,
  setCurrentMode,
  activeMatch,
  spectatorsCount,
  capacity,
  isSimulating,
  onResetSimulation,
  alertCount,
}: HeaderProps) {
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <header className="h-16 border-b border-fifa flex items-center justify-between px-4 sm:px-6 bg-slate-900 text-slate-100 shrink-0 select-none z-50 sticky top-0" id="main-header">
      {/* Brand Logo & Meta */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gold flex items-center justify-center rounded shadow-lg shadow-yellow-500/10">
          <span className="text-slate-950 font-black text-xl font-serif italic leading-none">W</span>
        </div>
        <div>
          <h1 className="text-xs sm:text-sm font-bold tracking-widest uppercase font-display flex items-center gap-1.5">
            Command Center : <span className="text-gold">FIFA 2026</span>
          </h1>
          <p className="text-[10px] opacity-60 uppercase tracking-tight font-mono">
            MetLife Stadium / East Rutherford, NJ
          </p>
        </div>
      </div>

      {/* Center - Live Telemetry Stats Board (Desktop/Tablet) */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {/* Match State */}
        <div className="text-right">
          <p className="text-[9px] uppercase opacity-50 font-mono tracking-wider">Game State</p>
          <p className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 justify-end">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            Live (82')
          </p>
        </div>

        {/* AI Confidence */}
        <div className="text-right">
          <p className="text-[9px] uppercase opacity-50 font-mono text-gold tracking-wider">AI Confidence</p>
          <div className="flex items-center gap-1 justify-end">
            <Cpu className="h-3 w-3 text-gold" />
            <p className="text-xs font-mono font-bold text-gold">98.4%</p>
          </div>
        </div>

        {/* Capacity Metrics */}
        <div className="bg-slate-950 px-3 py-1 rounded border border-fifa text-right hidden lg:block">
          <p className="text-[9px] uppercase opacity-50 font-mono">Current Capacity</p>
          <p className="text-xs font-mono font-bold text-emerald-400">
            {formatNumber(spectatorsCount)} <span className="text-slate-500">/ {formatNumber(capacity)}</span>
          </p>
        </div>
      </div>

      {/* Mode Switcher & Sim Control */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Simulation Reset Action */}
        {isSimulating && (
          <button
            onClick={onResetSimulation}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded border border-fifa transition flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono"
            title="Reset telemetry context to default"
            id="reset-sim-btn"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            <span className="hidden sm:inline">Reset Radar</span>
          </button>
        )}

        {/* Mode Selector Panel */}
        <div className="bg-slate-950 p-0.5 rounded border border-fifa flex items-center">
          <button
            onClick={() => setCurrentMode("fan")}
            className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider font-display transition-all duration-150 flex items-center gap-1.5 ${
              currentMode === "fan"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="toggle-fan-btn"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Concierge</span>
            <span className="xs:hidden">User</span>
          </button>
          
          <button
            onClick={() => setCurrentMode("ops")}
            className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider font-display transition-all duration-150 flex items-center gap-1.5 relative ${
              currentMode === "ops"
                ? "bg-slate-800 text-gold border border-gold/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="toggle-ops-btn"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            <span className="hidden xs:inline">Ops Desk</span>
            <span className="xs:hidden">Ops</span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center animate-bounce">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
