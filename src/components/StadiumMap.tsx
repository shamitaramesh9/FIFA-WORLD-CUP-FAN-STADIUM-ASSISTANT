import React from "react";
import { Sector, Gate, TransitHub } from "../types";
import { MapPin, ShieldAlert, Accessibility, Navigation } from "lucide-react";

interface StadiumMapProps {
  sectors: Sector[];
  gates: Gate[];
  transitHubs: TransitHub[];
  selectedItem: { type: "sector" | "gate" | "transit"; id: string } | null;
  setSelectedItem: (item: { type: "sector" | "gate" | "transit"; id: string } | null) => void;
  activeIncidentsCount: number;
}

export default function StadiumMap({
  sectors,
  gates,
  transitHubs,
  selectedItem,
  setSelectedItem,
  activeIncidentsCount,
}: StadiumMapProps) {
  // Helpers to get specific sector or gate status color
  const getSectorColor = (sector: Sector) => {
    if (sector.status === "critical") return "fill-rose-500/30 stroke-rose-500";
    if (sector.status === "congested") return "fill-amber-500/30 stroke-amber-500";
    if (sector.status === "busy") return "fill-amber-400/25 stroke-amber-400";
    return "fill-emerald-500/20 stroke-emerald-500";
  };

  const getGateBadgeClass = (gate: Gate) => {
    const isSelected = selectedItem?.type === "gate" && selectedItem.id === gate.id;
    let base = "px-2 py-1 text-[9px] font-mono font-bold text-white rounded border transition-all duration-150 flex items-center gap-1 shadow-lg ";
    if (gate.status === "overloaded") {
      base += "bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900";
    } else if (gate.status === "busy") {
      base += "bg-amber-950/80 border-amber-500/40 text-amber-300 hover:bg-amber-900";
    } else {
      base += "bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900";
    }
    
    if (isSelected) {
      base += " ring-2 ring-gold/65 scale-105 border-gold/50";
    }
    return base;
  };

  const getTransitColorClass = (transit: TransitHub) => {
    const isSelected = selectedItem?.type === "transit" && selectedItem.id === transit.id;
    let base = "px-2.5 py-1 text-[9px] font-mono font-bold rounded border transition-all duration-150 flex items-center gap-1 shadow-md ";
    
    if (transit.status === "suspended") {
      base += "bg-rose-950/80 text-rose-300 border-rose-500/30 hover:bg-rose-900";
    } else if (transit.status === "congested" || transit.status === "delayed") {
      base += "bg-amber-950/80 text-amber-300 border-amber-500/30 hover:bg-amber-900";
    } else {
      base += "bg-slate-900/90 text-emerald-400 border-white/10 hover:border-emerald-500/30";
    }

    if (isSelected) {
      base += " ring-2 ring-gold/65 scale-105";
    }
    return base;
  };

  return (
    <div className="bg-fifa-panel rounded-lg border border-fifa p-4 flex flex-col h-full text-slate-100" id="stadium-map-card">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5 font-display">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            2D Live Stadium Radar
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Click sectors, gates, or transit hubs to inspect</p>
        </div>
        <div className="flex items-center gap-2">
          {activeIncidentsCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-950/60 text-rose-400 text-[10px] font-mono font-bold border border-rose-500/30 rounded flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-rose-400" />
              {activeIncidentsCount} ALERTS
            </span>
          )}
          <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 text-[10px] font-mono font-bold border border-fifa rounded flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            SYNCED
          </span>
        </div>
      </div>

      {/* SVG Map Area */}
      <div className="relative flex-1 bg-[#010409] rounded border border-fifa flex items-center justify-center p-3 min-h-[300px] overflow-hidden">
        
        {/* Subtle Tech Grid lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>

        {/* Stadium Graphic Canvas */}
        <svg viewBox="0 0 400 400" className="w-full max-w-[320px] h-auto drop-shadow-2xl z-10">
          
          {/* Soccer Pitch Area (Center) */}
          <rect
            x="145"
            y="135"
            width="110"
            height="130"
            rx="6"
            className="fill-emerald-950/20 stroke-slate-800"
            strokeWidth="1.5"
          />
          {/* Pitch markings */}
          <line x1="145" y1="200" x2="255" y2="200" className="stroke-slate-800/40" strokeWidth="1" />
          <circle cx="200" cy="200" r="22" className="fill-none stroke-slate-800/40" strokeWidth="1" />
          <rect x="180" y="135" width="40" height="15" className="fill-none stroke-slate-800/40" strokeWidth="1" />
          <rect x="180" y="250" width="40" height="15" className="fill-none stroke-slate-800/40" strokeWidth="1" />

          {/* Sectors Outer Ring (Interactive Wedges) */}
          
          {/* Sector A - North (Top) */}
          <path
            d="M 90 90 A 155 155 0 0 1 310 90 L 250 140 A 70 70 0 0 0 150 140 Z"
            className={`transition duration-150 cursor-pointer stroke-[2.5] hover:opacity-90 ${getSectorColor(sectors[0])} ${
              selectedItem?.type === "sector" && selectedItem.id === "sec-a"
                ? "stroke-gold fill-emerald-500/35"
                : "stroke-slate-900"
            }`}
            onClick={() => setSelectedItem({ type: "sector", id: "sec-a" })}
            id="map-sector-a"
          />
          <text x="200" y="75" textAnchor="middle" className="fill-slate-300 font-display font-bold text-[10px] pointer-events-none uppercase tracking-wide">SEC A (N)</text>

          {/* Sector B - East (Right) */}
          <path
            d="M 310 90 A 155 155 0 0 1 310 310 L 250 260 A 70 70 0 0 0 250 140 Z"
            className={`transition duration-150 cursor-pointer stroke-[2.5] hover:opacity-90 ${getSectorColor(sectors[1])} ${
              selectedItem?.type === "sector" && selectedItem.id === "sec-b"
                ? "stroke-gold fill-emerald-500/35"
                : "stroke-slate-900"
            }`}
            onClick={() => setSelectedItem({ type: "sector", id: "sec-b" })}
            id="map-sector-b"
          />
          <text x="325" y="205" textAnchor="middle" className="fill-slate-300 font-display font-bold text-[10px] pointer-events-none uppercase tracking-wide" transform="rotate(90 325 205)">SEC B (E)</text>

          {/* Sector C - South (Bottom) */}
          <path
            d="M 310 310 A 155 155 0 0 1 90 310 L 150 260 A 70 70 0 0 0 250 260 Z"
            className={`transition duration-150 cursor-pointer stroke-[2.5] hover:opacity-90 ${getSectorColor(sectors[2])} ${
              selectedItem?.type === "sector" && selectedItem.id === "sec-c"
                ? "stroke-gold fill-emerald-500/35"
                : "stroke-slate-900"
            }`}
            onClick={() => setSelectedItem({ type: "sector", id: "sec-c" })}
            id="map-sector-c"
          />
          <text x="200" y="335" textAnchor="middle" className="fill-slate-300 font-display font-bold text-[10px] pointer-events-none uppercase tracking-wide">SEC C (S)</text>

          {/* Sector D - West (Left) */}
          <path
            d="M 90 310 A 155 155 0 0 1 90 90 L 150 140 A 70 70 0 0 0 150 260 Z"
            className={`transition duration-150 cursor-pointer stroke-[2.5] hover:opacity-90 ${getSectorColor(sectors[3])} ${
              selectedItem?.type === "sector" && selectedItem.id === "sec-d"
                ? "stroke-gold fill-emerald-500/35"
                : "stroke-slate-900"
            }`}
            onClick={() => setSelectedItem({ type: "sector", id: "sec-d" })}
            id="map-sector-d"
          />
          <text x="75" y="205" textAnchor="middle" className="fill-slate-300 font-display font-bold text-[10px] pointer-events-none uppercase tracking-wide" transform="rotate(-90 75 205)">SEC D (W)</text>

        </svg>

        {/* Floating Gate Interactive Badges */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setSelectedItem({ type: "gate", id: "gate-1" })}
            className={getGateBadgeClass(gates[0])}
            id="map-gate-1"
          >
            GATE 1
          </button>
        </div>

        <div className="absolute right-4 top-1/4 z-20">
          <button
            onClick={() => setSelectedItem({ type: "gate", id: "gate-2" })}
            className={getGateBadgeClass(gates[1])}
            id="map-gate-2"
          >
            GATE 2
          </button>
        </div>

        <div className="absolute right-10 bottom-12 z-20">
          <button
            onClick={() => setSelectedItem({ type: "gate", id: "gate-3" })}
            className={getGateBadgeClass(gates[2])}
            id="map-gate-3"
          >
            GATE 3
          </button>
        </div>

        <div className="absolute left-10 bottom-12 z-20">
          <button
            onClick={() => setSelectedItem({ type: "gate", id: "gate-4" })}
            className={getGateBadgeClass(gates[3])}
            id="map-gate-4"
          >
            GATE 4
          </button>
        </div>

        <div className="absolute left-4 top-1/4 z-20">
          <button
            onClick={() => setSelectedItem({ type: "gate", id: "gate-5" })}
            className={getGateBadgeClass(gates[4])}
            id="map-gate-5"
          >
            GATE 5
          </button>
        </div>

        {/* Bottom Transit Stations Overlays */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 w-full max-w-[95%] justify-center px-1">
          {transitHubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelectedItem({ type: "transit", id: hub.id })}
              className={getTransitColorClass(hub)}
              id={`map-hub-${hub.id}`}
            >
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate max-w-[55px] sm:max-w-[80px]">
                {hub.name.replace("Station", "Stn").replace("Bus Shuttle", "Shuttle")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Element Inspect Board */}
      <div className="mt-3 bg-slate-950 rounded border border-fifa p-3 min-h-[85px] select-none">
        {selectedItem ? (
          <div id="inspector-panel" className="font-mono text-[11px]">
            {selectedItem.type === "sector" && (() => {
              const sector = sectors.find((s) => s.id === selectedItem.id);
              if (!sector) return null;
              return (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center pb-1.5 border-b border-fifa mb-1.5">
                    <span className="font-bold text-gold uppercase tracking-wider">{sector.name} Radar</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      sector.status === "critical" || sector.status === "congested"
                        ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {sector.status} FLOW
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">CROWD DENSITY</span>
                      <span className="font-bold text-slate-200">{sector.crowdDensity}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">GATE DELAY</span>
                      <span className="font-bold text-slate-200">{sector.gateWaitTime}m wait</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">STAFF COUNT</span>
                      <span className="font-bold text-slate-200">{sector.staffCount} volunteers</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedItem.type === "gate" && (() => {
              const gate = gates.find((g) => g.id === selectedItem.id);
              if (!gate) return null;
              return (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center pb-1.5 border-b border-fifa mb-1.5">
                    <span className="font-bold text-gold uppercase tracking-wider">{gate.name} ENTRANCE</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      gate.status === "overloaded"
                        ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {gate.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">QUEUE DELAY</span>
                      <span className="font-bold text-slate-200">{gate.waitTime} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">ACCESSIBILITY</span>
                      <span className="font-bold text-slate-200 flex items-center gap-0.5">
                        <Accessibility className="h-3 w-3 text-emerald-400" />
                        {gate.wheelchairAccess ? "RAMPS OK" : "DOWN / ERROR"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">TRANSIT CONNECTION</span>
                      <span className="font-bold text-slate-300 truncate block max-w-[85px]" title={gate.transitConnection}>
                        {gate.transitConnection}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedItem.type === "transit" && (() => {
              const hub = transitHubs.find((h) => h.id === selectedItem.id);
              if (!hub) return null;
              return (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center pb-1.5 border-b border-fifa mb-1.5">
                    <span className="font-bold text-gold uppercase tracking-wider">{hub.name} TERMINAL</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      hub.status === "suspended" || hub.status === "congested"
                        ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                        : "bg-slate-900 text-emerald-400 border border-white/10"
                    }`}>
                      {hub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">STATION DELAY</span>
                      <span className="font-bold text-slate-200">{hub.avgWaitTime} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">DEPARTURES</span>
                      <span className="font-bold text-slate-200 truncate block max-w-[85px]">{hub.nextDepartures}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">ECO RATING</span>
                      <span className="font-bold text-emerald-400">{hub.ecoRating}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-[10px] py-2 text-center uppercase tracking-wider">
            <span>NO DEPLOYED UNIT SELECTED</span>
            <span className="text-[9px] opacity-60 mt-0.5 font-sans">Click on any Sector wedge, Gate tag, or Transit station on the map radar above</span>
          </div>
        )}
      </div>
    </div>
  );
}
