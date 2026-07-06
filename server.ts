import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Google GenAI Client to prevent startup crashes when key is missing
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your API key in the Settings/Secrets panel of Google AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Check if Gemini API is available
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    geminiConfigured: hasKey,
    time: new Date().toISOString(),
  });
});

// Endpoint: Fan & Volunteer Concierge Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, telemetryContext, language } = req.body;
    
    const ai = getGenAI();
    
    // Create stadium state string for grounding the AI
    const telemetryString = telemetryContext 
      ? JSON.stringify(telemetryContext, null, 2)
      : "No live telemetry available. Ground assistance on general Estadio Azteca / MetLife Stadium logistics.";

    const systemInstruction = `You are "Aura", the official AI Stadium Operations and Fan Concierge for the FIFA World Cup 2026.
You are assisting fans, volunteers, and stadium staff during the tournament.
You must be extremely helpful, professional, polite, and maintain an enthusiastic World Cup vibe.

You have access to the LIVE STADIUM TELEMETRY of the stadium (MetLife Stadium, NJ, hosting the Grand Final):
${telemetryString}

Current selected language: ${language || "English"}. You must ALWAYS reply in the requested language. If the fan asks in Spanish, reply in Spanish, etc.

Key guidelines for your responses:
1. NAVIGATION & TRANSPORT: Give clear directions based on the active telemetry. For example, if Gate 2 is overcrowded, recommend Gate 1 or 3. If Lot B shuttle is congested, suggest the Meadowlands Rail line.
2. ACCESSIBILITY: Prioritize accessibility. If Elevator #3 near Gate 2 is down (as shown in telemetry or incidents), direct wheelchair/limited-mobility fans to Elevator #1 near Gate 4.
3. SUSTAINABILITY: If asked about recycling, water stations, or sustainability, advocate for the "Green Stadium" initiatives. Remind fans that MetLife is a zero-waste stadium and water stations allow reusable cups.
4. LANGUAGE & VOICE: Keep responses clear, warm, and structured. Use bullet points for steps. Keep the length balanced (under 250 words) so it's easy to read on mobile devices in a crowded stadium.
5. GROUNDING: Strictly rely on the live telemetry provided above for real-time status. Do not invent gate wait times or train schedules that contradict the telemetry context.`;

    // Map history to the Gemini API format
    // In @google/genai, chat takes a simple list of turns or we can usegenerateContent with conversation history
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || "I apologize, I am having trouble accessing the stadium networks. Please ask a physical volunteer nearby.",
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ 
      error: error.message || "Failed to process chat",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Endpoint: AI Real-time Incident Mitigation & Decision Support (Ops Deck)
app.post("/api/ops/analyze", async (req, res) => {
  try {
    const { telemetryContext, activeIncident, query } = req.body;
    
    const ai = getGenAI();
    
    const telemetryString = JSON.stringify(telemetryContext, null, 2);
    
    const systemInstruction = `You are the chief "ArenaOps GenAI Command Copilot" for the FIFA World Cup 2026.
Your job is to provide real-time decision support, incident analysis, crowd mitigation tactics, and resource allocation instructions for Stadium organizers and Venue operations staff.

You must analyze the stadium conditions and output a detailed, highly structured, actionable response in JSON format.
The JSON must contain:
1. "situationSummary": A brief 1-2 sentence overview of the critical operational challenge.
2. "severity": One of "LOW", "MEDIUM", "HIGH", "CRITICAL" based on the telemetry and active incidents.
3. "mitigationSteps": An array of concrete, step-by-step instructions for venue staff (e.g. dispatching volunteers, re-routing gates, updating digital signage).
4. "fanCommunication": A drafted broadcast message (in English and Spanish) to push to fans' World Cup apps.
5. "volunteerDirectives": Specific instructions for stadium volunteer squads (Squad A, B, C etc.) to assist fans.
6. "sustainabilityImpact": Brief assessment of how this incident/response affects green stadium metrics (e.g. food waste, clean water, power consumption).

Current live stadium telemetry:
${telemetryString}

Active incident: ${activeIncident || "None"}
User Operational Query/Prompt: ${query || "Analyze current stadium status for optimal flow."}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Formulate the response according to instructions.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            situationSummary: { type: Type.STRING },
            severity: { type: Type.STRING },
            mitigationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fanCommunication: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                spanish: { type: Type.STRING }
              },
              required: ["english", "spanish"]
            },
            volunteerDirectives: { type: Type.STRING },
            sustainabilityImpact: { type: Type.STRING }
          },
          required: [
            "situationSummary", 
            "severity", 
            "mitigationSteps", 
            "fanCommunication", 
            "volunteerDirectives", 
            "sustainabilityImpact"
          ]
        },
        temperature: 0.2, // Low temperature for consistent, strict operational intelligence
      },
    });

    const output = JSON.parse(response.text || "{}");
    res.json(output);
  } catch (error: any) {
    console.error("Error in /api/ops/analyze:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze stadium operations",
      isConfigError: !process.env.GEMINI_API_KEY
    });
  }
});

// Serve Frontend using Vite or static directory
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup 2026 ArenaOps Server running on http://localhost:${PORT}`);
  });
}

startServer();
