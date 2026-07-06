import React, { useState, useEffect, useRef } from "react";
import { Message, StadiumTelemetry } from "../types";
import { Send, Sparkles, Languages, Accessibility, Trash2, HelpCircle, AlertCircle } from "lucide-react";

interface FanConciergeProps {
  telemetry: StadiumTelemetry;
}

export default function FanConcierge({ telemetry }: FanConciergeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am Aura, your official FIFA World Cup 2026 Stadium Concierge. How can I assist you, your volunteer crew, or a fan with navigation, accessibility, or transit today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { name: "English", code: "en", flag: "🇺🇸" },
    { name: "Español", code: "es", flag: "🇲🇽" },
    { name: "Français", code: "fr", flag: "🇫🇷" },
    { name: "Português", code: "pt", flag: "🇧🇷" },
    { name: "العربية", code: "ar", flag: "🇶🇦" },
  ];

  const suggestedQuestions = [
    { text: "Where is the nearest wheelchair-accessible entrance?", icon: <Accessibility className="h-3.5 w-3.5 text-emerald-400" /> },
    { text: "What is the fastest transit route from Gate 3?", icon: "🚇" },
    { text: "How does the zero-waste system work here?", icon: "♻️" },
    { text: "Are there any busy sectors I should avoid right now?", icon: "⚠️" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10), // Send last 10 messages for context
          telemetryContext: telemetry,
          language: language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server response failed");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "model",
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while calling the Gemini API on the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: `Hello! I am Aura, your official FIFA World Cup 2026 Stadium Concierge. I have been loaded with fresh live telemetry context. Ask me anything in ${language}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="bg-fifa-panel rounded-lg border border-fifa shadow-lg flex flex-col h-[520px] overflow-hidden text-slate-100" id="fan-concierge-card">
      {/* Header Panel */}
      <div className="bg-slate-900 px-4 py-3 border-b border-fifa flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest font-display text-slate-200">
              Aura : Fan Concierge
            </h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-tight font-mono">Multilingual GenAI Stadium Guide</p>
          </div>
        </div>

        {/* Translation & Utility controls */}
        <div className="flex items-center gap-2">
          <Languages className="h-3.5 w-3.5 text-gold" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 text-slate-300 text-[10px] font-mono font-bold py-1 px-1.5 rounded border border-fifa focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
            id="lang-select"
          >
            {languages.map((l) => (
              <option key={l.name} value={l.name} className="bg-slate-950 text-slate-100">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleClearChat}
            className="p-1 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded border border-fifa transition"
            title="Clear Feed History"
            id="clear-chat-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages scrolling stack */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#010409]/30" id="chat-messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            id={`chat-msg-${msg.id}`}
          >
            <div
              className={`max-w-[85%] rounded p-3 text-xs shadow ${
                msg.role === "user"
                  ? "bg-slate-800 text-slate-100 border border-fifa rounded-br-none"
                  : "bg-slate-900 text-slate-200 border border-fifa rounded-bl-none"
              }`}
            >
              <div className="font-sans leading-relaxed whitespace-pre-line text-[11px]">
                {msg.content}
              </div>
              <span
                className={`text-[8px] block text-right mt-1 font-mono uppercase ${
                  msg.role === "user" ? "text-emerald-400/80" : "text-slate-500"
                }`}
              >
                {msg.timestamp} • {msg.role === "user" ? "FAN_FEED" : "AI_AGENT_AURA"}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start" id="chat-loading-indicator">
            <div className="bg-slate-900 rounded p-3 border border-fifa flex items-center gap-2 text-slate-400 text-[10px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              <span>Aura is formulating advice via ArenaOps Telemetry...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 rounded border border-rose-500/25 text-rose-300 text-[10px] flex gap-2 font-mono" id="chat-error-banner">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-rose-400">GenAI connection error:</span> {errorMsg}
              <p className="mt-1 text-slate-400 text-[9px] font-sans">Please ensure your GEMINI_API_KEY is configured in the Secrets Panel in the bottom/side editor bar of Google AI Studio.</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended shortcuts prompts */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-fifa flex flex-wrap gap-1.5 shrink-0 select-none">
        <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider w-full mb-1 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 text-slate-500" /> Grounded Prompt Shortcuts
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q.text)}
            className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-mono rounded border border-fifa hover:border-gold/30 transition text-left flex items-center gap-1.5"
            disabled={isLoading}
            id={`suggest-btn-${i}`}
          >
            <span>{typeof q.icon === "string" ? q.icon : "🤖"}</span>
            <span className="truncate max-w-[170px]">{q.text}</span>
          </button>
        ))}
      </div>

      {/* Message input panel */}
      <div className="p-3 bg-slate-950 border-t border-fifa flex gap-1.5 items-center shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(input);
          }}
          placeholder={`Ask Aura about ${telemetry.stadiumName} routes, transit, and green bins...`}
          className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 rounded py-2 px-3 text-xs border border-fifa focus:outline-none focus:border-gold/40 transition font-sans"
          disabled={isLoading}
          id="chat-text-input"
        />
        <button
          onClick={() => handleSendMessage(input)}
          className="bg-gold hover:bg-yellow-500 text-slate-950 p-2.5 rounded transition flex items-center justify-center disabled:opacity-50 font-bold"
          disabled={isLoading || !input.trim()}
          id="send-msg-btn"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
