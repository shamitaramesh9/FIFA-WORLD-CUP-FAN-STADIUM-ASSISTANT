import React, { useState, useEffect } from "react";
import { StadiumTelemetry, Sector, Gate, TransitHub, Incident, OpsDecision } from "./types";
import Header from "./components/Header";
import StadiumMap from "./components/StadiumMap";
import FanConcierge from "./components/FanConcierge";
import { 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Leaf, 
  Zap, 
  Users, 
  Sliders, 
  CheckCircle2, 
  Volume2, 
  Cpu, 
  HelpCircle,
  Clock,
  MapPin,
  Flame
} from "lucide-react";

// Default Stadium Telemetry Context for MetLife Stadium Hosting the Grand Final
const DEFAULT_TELEMETRY: StadiumTelemetry = {
  stadiumName: "MetLife Stadium",
  activeMatch: "Grand Final: Argentina vs France",
  spectatorsCount: 82401,
  capacity: 82500,
  sectors: [
    { id: "sec-a", name: "Sector A (North)", crowdDensity: 42, gateWaitTime: 8, status: "clear", staffCount: 180, elevatorsActive: true },
    { id: "sec-b", name: "Sector B (East)", crowdDensity: 88, gateWaitTime: 22, status: "congested", staffCount: 310, elevatorsActive: true },
    { id: "sec-c", name: "Sector C (South)", crowdDensity: 94, gateWaitTime: 34, status: "critical", staffCount: 420, elevatorsActive: false },
    { id: "sec-d", name: "Sector D (West)", crowdDensity: 55, gateWaitTime: 12, status: "busy", staffCount: 220, elevatorsActive: true },
  ],
  gates: [
    { id: "gate-1", name: "Gate 1 (North)", waitTime: 6, status: "normal", wheelchairAccess: true, transitConnection: "Lot A Parking" },
    { id: "gate-2", name: "Gate 2 (East)", waitTime: 24, status: "busy", wheelchairAccess: true, transitConnection: "Meadowlands Rail" },
    { id: "gate-3", name: "Gate 3 (South)", waitTime: 42, status: "overloaded", wheelchairAccess: false, transitConnection: "Bus Terminal" },
    { id: "gate-4", name: "Gate 4 (South)", waitTime: 18, status: "busy", wheelchairAccess: true, transitConnection: "Rideshare Hub" },
    { id: "gate-5", name: "Gate 5 (West)", waitTime: 9, status: "normal", wheelchairAccess: true, transitConnection: "Lot G Parking" },
  ],
  transitHubs: [
    { id: "rail", name: "Meadowlands Rail Station", status: "delayed", avgWaitTime: 18, nextDepartures: "Trains every 8 min", ecoRating: "Excellent" },
    { id: "shuttle", name: "Lot B Parking Shuttle", status: "congested", avgWaitTime: 14, nextDepartures: "Continuous Loop", ecoRating: "Fair" },
    { id: "express", name: "NYC Port Authority Express", status: "normal", avgWaitTime: 5, nextDepartures: "Buses every 3 min", ecoRating: "Good" },
  ],
  sustainability: {
    recycleRate: 78,
    smartBinsFilled: 44,
    waterRefillsSaved: 104240,
    solarGenerationKW: 680,
  },
  incidents: [
    {
      id: "inc-1",
      title: "Gate 3 Ticket Scanner Fault",
      sector: "Sector C (South)",
      severity: "high",
      status: "active",
      description: "Two primary electronic ticket turnstiles in Gate 3 are unresponsive. Volunteers are manually verifying, causing backup queues.",
      reportedTime: "14:15",
    },
    {
      id: "inc-2",
      title: "Elevator #3 Offline",
      sector: "Sector C (South)",
      severity: "medium",
      status: "mitigating",
      description: "Accessibility elevator #3 stalled between levels 2 and 3. Maintenance technician dispatched.",
      reportedTime: "14:20",
    },
  ],
};

// Simulated Presets for different Arena conditions
const SCENARIOS = [
  {
    name: "Standard Final Rush",
    desc: "Default tournament peak conditions.",
    modifier: (telemetry: StadiumTelemetry): StadiumTelemetry => ({
      ...DEFAULT_TELEMETRY
    })
  },
  {
    name: "Sudden Summer Downpour",
    desc: "Heavy rainstorm over East Rutherford.",
    modifier: (telemetry: StadiumTelemetry): StadiumTelemetry => {
      const updatedSectors = telemetry.sectors.map(s => ({
        ...s,
        gateWaitTime: Math.min(s.gateWaitTime + 15, 60),
        status: s.crowdDensity > 60 ? "critical" as const : "congested" as const
      }));
      const updatedGates = telemetry.gates.map(g => ({
        ...g,
        waitTime: Math.min(g.waitTime + 20, 60),
        status: "overloaded" as const
      }));
      return {
        ...telemetry,
        sectors: updatedSectors,
        gates: updatedGates,
        transitHubs: telemetry.transitHubs.map(h => ({
          ...h,
          status: "congested" as const,
          avgWaitTime: h.avgWaitTime + 10
        })),
        incidents: [
          ...telemetry.incidents,
          {
            id: `inc-rain-${Date.now()}`,
            title: "Flash Congestion: Gate A Shelters",
            sector: "Sector A (North)",
            severity: "medium",
            status: "active",
            description: "Fans crowding under awnings near Gate 1 entrance to escape rain, blocking incoming flow.",
            reportedTime: "14:26"
          }
        ]
      };
    }
  },
  {
    name: "Rail System Signal failure",
    desc: "NJ Transit rail system goes offline.",
    modifier: (telemetry: StadiumTelemetry): StadiumTelemetry => {
      const updatedHubs = telemetry.transitHubs.map(h => 
        h.id === "rail" 
          ? { ...h, status: "suspended" as const, avgWaitTime: 90, nextDepartures: "SUSPENDED" }
          : { ...h, status: "congested" as const, avgWaitTime: h.avgWaitTime + 15 }
      );
      return {
        ...telemetry,
        transitHubs: updatedHubs,
        incidents: [
          ...telemetry.incidents,
          {
            id: `inc-rail-${Date.now()}`,
            title: "NJ Transit Rail Suspension",
            sector: "Sector B (East)",
            severity: "critical",
            status: "active",
            description: "A signal power outage has suspended all inbound and outbound trains from the stadium rail station. Crowd redirect is required immediately.",
            reportedTime: "14:31"
          }
        ]
      };
    }
  },
  {
    name: "Sustainability Rush Hour",
    desc: "Peak fan recycling and solar load.",
    modifier: (telemetry: StadiumTelemetry): StadiumTelemetry => ({
      ...telemetry,
      sustainability: {
        recycleRate: 92,
        smartBinsFilled: 85,
        waterRefillsSaved: 145020,
        solarGenerationKW: 910,
      }
    })
  }
];

export default function App() {
  const [currentMode, setCurrentMode] = useState<"fan" | "ops">("ops");
  const [telemetry, setTelemetry] = useState<StadiumTelemetry>(DEFAULT_TELEMETRY);
  const [selectedItem, setSelectedItem] = useState<{ type: "sector" | "gate" | "transit"; id: string } | null>({ type: "sector", id: "sec-c" });
  
  // Custom simulation variables
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);

  // Copilot Form States
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("inc-1");
  const [customOpsPrompt, setCustomOpsPrompt] = useState("");
  const [isOpsAnalyzing, setIsOpsAnalyzing] = useState(false);
  const [opsAnalysisResult, setOpsAnalysisResult] = useState<OpsDecision | null>(null);
  const [opsError, setOpsError] = useState<string | null>(null);

  // Pushed broadcast messages to simulate stadium digital screens
  const [activeBroadcast, setActiveBroadcast] = useState<{ english: string; spanish: string } | null>({
    english: "Welcome to MetLife Stadium! Avoid Gate 3 due to high traffic; please utilize Gate 1 or Gate 5 for optimal entry.",
    spanish: "¡Bienvenidos al Estadio MetLife! Evite la Puerta 3 debido al alto tráfico; use la Puerta 1 o la Puerta 5 para ingresar más rápido.",
  });

  const [decisionLog, setDecisionLog] = useState<Array<{ text: string; time: string; type: string }>>([
    { text: "STADIUM BROADCAST SYSTEM ACTIVATED", time: "14:02", type: "system" },
    { text: "RE-ROUTE FLOW OPTIMIZED : GATE 3 TO GATE 5", time: "14:15", type: "reroute" },
    { text: "SUSTAINABILITY RECYCLE RATE INCREASED TO 78%", time: "14:22", type: "green" },
  ]);

  // Handle changing simulation scenarios
  const handleScenarioChange = (idx: number) => {
    setActiveScenarioIdx(idx);
    const modifiedData = SCENARIOS[idx].modifier(DEFAULT_TELEMETRY);
    setTelemetry(modifiedData);
    
    // Set first incident from modified dataset as selected
    if (modifiedData.incidents.length > 0) {
      setSelectedIncidentId(modifiedData.incidents[0].id);
    } else {
      setSelectedIncidentId("");
    }
    
    // Add to logs
    setDecisionLog(prev => [
      { text: `SIMULATED EVENT: ${SCENARIOS[idx].name.toUpperCase()}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "system" },
      ...prev
    ]);
  };

  const handleResetSimulation = () => {
    setActiveScenarioIdx(0);
    setTelemetry(DEFAULT_TELEMETRY);
    setSelectedIncidentId("inc-1");
    setSelectedItem({ type: "sector", id: "sec-c" });
    setDecisionLog(prev => [
      { text: "RADAR TELEMETRY CALIBRATION RESET", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "system" },
      ...prev
    ]);
  };

  // Submit Operations Scenario to Gemini API for real-time Mitigation & Decision Support
  const handleTriggerOpsAnalysis = async () => {
    setIsOpsAnalyzing(true);
    setOpsError(null);

    const activeIncidentObj = telemetry.incidents.find(inc => inc.id === selectedIncidentId);
    const activeIncidentText = activeIncidentObj 
      ? `[${activeIncidentObj.title}] in ${activeIncidentObj.sector}. Description: ${activeIncidentObj.description}`
      : "No critical incidents selected. General crowd optimization.";

    try {
      const response = await fetch("/api/ops/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemetryContext: telemetry,
          activeIncident: activeIncidentText,
          query: customOpsPrompt || "Analyze current stadium bottlenecks and suggest volunteer mitigation steps."
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Mitigation analysis failed");
      }

      const data: OpsDecision = await response.json();
      setOpsAnalysisResult(data);
      
      // Update active broadcasts with the GenAI response!
      if (data.fanCommunication) {
        setActiveBroadcast(data.fanCommunication);
      }

      // Append to local audit log
      setDecisionLog(prev => [
        { 
          text: `GENAI ADVICE INCIDENT #${selectedIncidentId.toUpperCase()}: ${data.severity} SEVERITY`, 
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 
          type: "ai" 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
      setOpsError(err.message || "Could not retrieve operational intelligence from Gemini model. Check API configuration.");
    } finally {
      setIsOpsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-fifa-dark text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Header Bar */}
      <Header 
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        activeMatch={telemetry.activeMatch}
        spectatorsCount={telemetry.spectatorsCount}
        capacity={telemetry.capacity}
        isSimulating={isSimulating}
        onResetSimulation={handleResetSimulation}
        alertCount={telemetry.incidents.filter(i => i.status === "active").length}
      />

      {/* Main Body */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        
        {/* Left Sidebar: Live Telemetry Tickers, Alerts & Simulation Deck */}
        <aside className="lg:col-span-3 border-r border-fifa bg-fifa-panel flex flex-col p-4 space-y-4">
          
          {/* Simulation Controller Panel */}
          <div className="bg-slate-950 p-3 rounded border border-fifa">
            <h2 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2.5 flex items-center gap-1.5 font-mono">
              <Sliders className="h-3.5 w-3.5 text-gold" />
              Arena Conditions Simulator
            </h2>
            <p className="text-[10px] text-slate-400 mb-3 font-sans leading-tight">
              Toggle tournament scenarios to test how the GenAI engine alters instructions based on live radar telemetry:
            </p>
            <div className="space-y-1.5">
              {SCENARIOS.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScenarioChange(idx)}
                  className={`w-full text-left px-2.5 py-2 rounded text-[11px] font-mono border transition flex justify-between items-center ${
                    activeScenarioIdx === idx
                      ? "bg-slate-800 text-gold border-gold/30 font-bold"
                      : "bg-slate-900 text-slate-400 border-fifa hover:text-slate-200"
                  }`}
                  id={`scenario-btn-${idx}`}
                >
                  <div className="flex flex-col">
                    <span>{scen.name}</span>
                    <span className="text-[8px] opacity-65 font-sans lowercase font-normal">{scen.desc}</span>
                  </div>
                  {activeScenarioIdx === idx && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Incidents Queue Status */}
          <div className="flex flex-col">
            <h2 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Live Operations Alerts ({telemetry.incidents.length})
            </h2>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {telemetry.incidents.map((inc) => (
                <div 
                  key={inc.id}
                  className={`p-2 rounded border font-mono text-[11px] transition flex flex-col gap-1 ${
                    inc.severity === "critical"
                      ? "bg-rose-950/20 border-rose-500/30"
                      : inc.severity === "high"
                      ? "bg-rose-900/10 border-rose-500/20"
                      : "bg-amber-950/10 border-amber-500/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold uppercase tracking-wide ${
                      inc.severity === "critical" || inc.severity === "high" ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {inc.title}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">{inc.reportedTime}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal font-sans">
                    {inc.description}
                  </p>
                  <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400 border-t border-white/5 pt-1 font-mono">
                    <span className="uppercase text-gold">{inc.sector}</span>
                    <span className="uppercase text-[8px] px-1 bg-slate-900 rounded">{inc.status}</span>
                  </div>
                </div>
              ))}
              {telemetry.incidents.length === 0 && (
                <div className="p-3 bg-emerald-950/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono text-center uppercase rounded">
                  All systems green. Zero active incidents.
                </div>
              )}
            </div>
          </div>

          {/* Real-time Decision Log */}
          <div className="flex-1 flex flex-col min-h-[140px]">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
              Decision & Action Ticker
            </h2>
            <div className="flex-1 bg-slate-950 border border-fifa rounded p-2.5 overflow-y-auto text-[9px] font-mono space-y-2 text-slate-300 max-h-[160px] lg:max-h-none">
              {decisionLog.map((log, i) => (
                <div key={i} className="flex justify-between items-start gap-1.5 border-b border-white/5 pb-1 select-text">
                  <span className={`leading-normal ${
                    log.type === "system" ? "text-slate-400" : log.type === "ai" ? "text-gold" : "text-emerald-400"
                  }`}>
                    {log.text}
                  </span>
                  <span className="opacity-40 shrink-0 text-[8px]">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Canvas: Live Radar Maps & Sustainability Overviews */}
        <section className="lg:col-span-5 border-r border-fifa p-4 flex flex-col gap-4 bg-[#010409]/65">
          
          {/* MetLife 2D Live Radar component */}
          <div className="flex-1 min-h-[380px]">
            <StadiumMap 
              sectors={telemetry.sectors}
              gates={telemetry.gates}
              transitHubs={telemetry.transitHubs}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              activeIncidentsCount={telemetry.incidents.filter(i => i.status === "active").length}
            />
          </div>

          {/* Bottom Row: Sustainability & Eco-Indicators (Horizontal bar) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <div className="bg-fifa-panel p-2.5 border border-fifa rounded flex items-center gap-2.5 font-mono">
              <div className="p-1.5 bg-emerald-950 rounded text-emerald-400 border border-emerald-500/20">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none">Recycling</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{telemetry.sustainability.recycleRate}%</p>
              </div>
            </div>

            <div className="bg-fifa-panel p-2.5 border border-fifa rounded flex items-center gap-2.5 font-mono">
              <div className="p-1.5 bg-yellow-950 rounded text-yellow-400 border border-yellow-500/20">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none">Solar Gen</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{telemetry.sustainability.solarGenerationKW}kW</p>
              </div>
            </div>

            <div className="bg-fifa-panel p-2.5 border border-fifa rounded flex items-center gap-2.5 font-mono">
              <div className="p-1.5 bg-blue-950 rounded text-blue-400 border border-blue-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none">Water Saved</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{telemetry.sustainability.waterRefillsSaved.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-fifa-panel p-2.5 border border-fifa rounded flex items-center gap-2.5 font-mono">
              <div className="p-1.5 bg-slate-900 rounded text-slate-400 border border-fifa">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none">Smart Bins</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{telemetry.sustainability.smartBinsFilled}% full</p>
              </div>
            </div>

          </div>
        </section>

        {/* Right Sidebar: Dynamic Mode Views */}
        <section className="lg:col-span-4 p-4 flex flex-col space-y-4">
          
          {currentMode === "fan" ? (
            /* FAN & VOLUNTEER ASSISTANT MODE */
            <div className="flex flex-col h-full space-y-4">
              <FanConcierge telemetry={telemetry} />
              
              {/* Active Stadium Broadcasts Billboard (Simulated Screen) */}
              <div className="bg-fifa-panel rounded-lg border border-fifa p-4 flex flex-col gap-2.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2 font-display">
                  <Volume2 className="h-4 w-4 text-gold" />
                  Live Stadium Signage Broadcast
                </h3>
                {activeBroadcast ? (
                  <div className="space-y-2 text-xs font-mono select-text bg-[#010409] border border-fifa p-3 rounded">
                    <div>
                      <span className="text-emerald-400 block text-[9px] uppercase font-bold">🇬🇧 English App Notification</span>
                      <p className="text-slate-200 font-sans leading-relaxed mt-0.5">{activeBroadcast.english}</p>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <span className="text-gold block text-[9px] uppercase font-bold">🇲🇽 Spanish / Multilingual Push</span>
                      <p className="text-slate-300 font-sans leading-relaxed mt-0.5">{activeBroadcast.spanish}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono text-center py-4 uppercase">
                    No active emergency broadcasts at this time.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ARENAOPS GENAI COMMAND DECK MODE */
            <div className="flex flex-col h-full space-y-4">
              
              {/* GenAI Commander Copilot Panel */}
              <div className="bg-fifa-panel rounded-lg border border-fifa p-4 flex flex-col space-y-3 flex-1 overflow-y-auto">
                
                <div className="flex justify-between items-center border-b border-fifa pb-2">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-gold" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 font-display">
                      ArenaOps GenAI Copilot
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 bg-slate-950 text-gold text-[9px] font-mono border border-gold/15 rounded">
                    GEMINI-3.5
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Analyze dynamic stadium radar coordinates. Select a target incident to generate mitigation steps, staff alerts, and drafted multilingual broadcasts:
                </p>

                {/* Form fields */}
                <div className="space-y-3 text-[11px] font-mono">
                  
                  {/* Incident target selector */}
                  <div>
                    <label className="text-slate-400 block text-[9px] uppercase mb-1 font-bold">TARGET EVENT INCIDENT</label>
                    <select
                      value={selectedIncidentId}
                      onChange={(e) => setSelectedIncidentId(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 py-2 px-2.5 rounded border border-fifa focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                      id="incident-selector"
                    >
                      <option value="" className="bg-slate-950">--- General Stadium Optimization ---</option>
                      {telemetry.incidents.map(inc => (
                        <option key={inc.id} value={inc.id} className="bg-slate-950">
                          {inc.id.toUpperCase()} : {inc.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Custom Instructions / Prompt */}
                  <div>
                    <label className="text-slate-400 block text-[9px] uppercase mb-1 font-bold">ADDITIONAL MITIGATION DIRECTIVES</label>
                    <textarea
                      value={customOpsPrompt}
                      onChange={(e) => setCustomOpsPrompt(e.target.value)}
                      placeholder="e.g. Prioritize rerouting wheelchair fans. Dispatch volunteer squad G to Gate 2..."
                      rows={2}
                      className="w-full bg-slate-950 text-slate-200 py-2 px-2.5 rounded border border-fifa focus:outline-none focus:ring-1 focus:ring-gold font-sans text-xs placeholder-slate-600"
                      id="ops-custom-directive"
                    />
                  </div>

                  {/* Trigger Button */}
                  <button
                    onClick={handleTriggerOpsAnalysis}
                    disabled={isOpsAnalyzing}
                    className="w-full bg-gold hover:bg-yellow-500 text-slate-950 font-bold uppercase tracking-wider py-2.5 rounded shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5 text-xs transition duration-150"
                    id="ops-trigger-btn"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isOpsAnalyzing ? "Generating Mitigation Plan..." : "Formulate Decision Support"}
                  </button>

                </div>

                {/* Gemini Output Result Screen */}
                <div className="flex-1 flex flex-col min-h-[220px] bg-slate-950 border border-fifa rounded overflow-hidden">
                  
                  <div className="bg-slate-900 border-b border-fifa px-3 py-1.5 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">COPLIT RESPONSE LOG</span>
                    {opsAnalysisResult && (
                      <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                        opsAnalysisResult.severity === "CRITICAL" || opsAnalysisResult.severity === "HIGH"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {opsAnalysisResult.severity} RISK
                      </span>
                    )}
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto text-xs space-y-3 font-sans select-text" id="ops-result-viewer">
                    {isOpsAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-[10px] space-y-2 py-8">
                        <Cpu className="h-8 w-8 text-gold animate-bounce" />
                        <span className="animate-pulse">COPLIT ENGINE SYNCHRONIZING REAL-TIME RADAR FEED...</span>
                      </div>
                    ) : opsError ? (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-500/20 text-rose-300 font-mono text-[10px] space-y-2">
                        <div className="font-bold flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> DECISION ENGINE ERROR</div>
                        <p>{opsError}</p>
                      </div>
                    ) : opsAnalysisResult ? (
                      <div className="space-y-3 text-[11px]">
                        
                        {/* Situation summary */}
                        <div>
                          <span className="text-[9px] font-mono text-gold block uppercase font-bold">Situation Summary</span>
                          <p className="text-slate-200 mt-0.5 italic">"{opsAnalysisResult.situationSummary}"</p>
                        </div>

                        {/* Mitigation steps list */}
                        <div>
                          <span className="text-[9px] font-mono text-gold block uppercase font-bold">Active Mitigation Steps</span>
                          <ul className="list-decimal list-inside space-y-1 mt-1 text-slate-300 font-sans pl-1">
                            {opsAnalysisResult.mitigationSteps.map((step, idx) => (
                              <li key={idx} className="leading-tight">{step}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Volunteer squad directives */}
                        <div>
                          <span className="text-[9px] font-mono text-gold block uppercase font-bold">Volunteer Squad Directives</span>
                          <p className="text-slate-300 leading-normal mt-0.5">{opsAnalysisResult.volunteerDirectives}</p>
                        </div>

                        {/* Drafted broadcast */}
                        <div className="bg-[#010409] border border-fifa p-2 rounded">
                          <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Autogenerated Fan Broadcast (Pushed)</span>
                          <p className="text-[10px] text-slate-300 font-sans mt-1">🇬🇧 {opsAnalysisResult.fanCommunication.english}</p>
                          <p className="text-[10px] text-slate-300 font-sans mt-1 italic">🇲🇽 {opsAnalysisResult.fanCommunication.spanish}</p>
                        </div>

                        {/* Sustainability Impact assessment */}
                        <div>
                          <span className="text-[9px] font-mono text-gold block uppercase font-bold">Sustainability Impact</span>
                          <p className="text-slate-400 leading-normal text-[10px] mt-0.5">{opsAnalysisResult.sustainabilityImpact}</p>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center font-mono py-8">
                        <Cpu className="h-6 w-6 text-slate-600 mb-2" />
                        <span className="text-[10px] uppercase">Awaiting Command directives</span>
                        <span className="text-[9px] opacity-60 font-sans mt-1">Select an incident above and click "Formulate Decision Support" to leverage Gemini 3.5 AI decision-support algorithms.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Quick Signage Broadcast Banner */}
              <div className="bg-fifa-panel rounded-lg border border-fifa p-4 flex flex-col gap-2 shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5 font-display">
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    Digital Display signage feed
                  </h3>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold rounded">
                    BROADCASTING
                  </span>
                </div>
                {activeBroadcast ? (
                  <div className="bg-[#010409] border border-fifa p-2.5 rounded text-[10px] font-mono">
                    <p className="text-slate-200 leading-relaxed font-sans">{activeBroadcast.english}</p>
                    <p className="text-slate-400 leading-relaxed font-sans italic mt-1 border-t border-white/5 pt-1">{activeBroadcast.spanish}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-[10px] font-mono text-center py-2 uppercase">No bulletin posted.</p>
                )}
              </div>

            </div>
          )}

        </section>

      </main>

      {/* Footer System Status Tickers */}
      <footer className="h-10 border-t border-fifa bg-slate-900 flex items-center px-4 justify-between text-[10px] uppercase font-mono shrink-0 select-none">
        <div className="flex gap-4 sm:gap-6 items-center">
          <span className="flex items-center gap-1">
            System: <span className="text-emerald-400 font-bold">ONLINE</span>
          </span>
          <span className="hidden sm:inline">
            Network latency: <span className="text-emerald-400 font-bold">0.42 ms</span>
          </span>
          <span className="hidden md:inline">
            Active security state: <span className="text-emerald-400 font-bold">LOW THREAT LEVEL</span>
          </span>
        </div>
        <div className="flex gap-4">
          <span className="hidden lg:inline text-slate-500">ArenaOps Core V4.2-Stadium</span>
          <span>© 2026 FIFA World Cup Ops</span>
        </div>
      </footer>

    </div>
  );
}
