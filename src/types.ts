export interface Sector {
  id: string;
  name: string;
  crowdDensity: number; // 0 to 100
  gateWaitTime: number; // in minutes
  status: "clear" | "busy" | "congested" | "critical";
  staffCount: number;
  elevatorsActive: boolean;
}

export interface Gate {
  id: string;
  name: string;
  waitTime: number; // minutes
  status: "normal" | "busy" | "overloaded";
  wheelchairAccess: boolean;
  transitConnection: string;
}

export interface TransitHub {
  id: string;
  name: string;
  status: "normal" | "delayed" | "congested" | "suspended";
  avgWaitTime: number; // minutes
  nextDepartures: string;
  ecoRating: "Excellent" | "Good" | "Fair";
}

export interface SustainabilityMetrics {
  recycleRate: number; // percentage
  smartBinsFilled: number; // percentage of capacity
  waterRefillsSaved: number; // count of bottles
  solarGenerationKW: number; // active power
}

export interface Incident {
  id: string;
  title: string;
  sector: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "mitigating" | "resolved";
  description: string;
  reportedTime: string;
}

export interface StadiumTelemetry {
  stadiumName: string;
  activeMatch: string;
  spectatorsCount: number;
  capacity: number;
  sectors: Sector[];
  gates: Gate[];
  transitHubs: TransitHub[];
  sustainability: SustainabilityMetrics;
  incidents: Incident[];
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface OpsDecision {
  situationSummary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigationSteps: string[];
  fanCommunication: {
    english: string;
    spanish: string;
  };
  volunteerDirectives: string;
  sustainabilityImpact: string;
}
