import { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { mockMessages, mockLeads } from "@/data/mockData";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const QUICK_REPLIES = [
  "Thanks for reaching out! 👋",
  "I'll review your documents shortly.",
  "Please submit your IELTS scorecard.",
  "Your payment link has been sent.",
];

const VOICE_TRANSCRIPT = `AI: Hello, may I speak with Arjun Mehta?
Arjun: Yes, speaking.
AI: Hi Arjun, I'm calling from VisaFlow regarding your H-1B visa application. Do you have a few minutes?
Arjun: Sure, go ahead.
AI: Great! I wanted to confirm your current employment at Infosys and your IELTS score of 7.5. Is that correct?
Arjun: Yes, that's correct.
AI: Perfect. Your application is looking strong. Your counsellor Riya will follow up with the document checklist today.`;

const CHANNEL_BADGE = {
  whatsapp: { label: "WhatsApp", icon: "chat",   bg: "#e8f5e9", color: "#2e7d32" },
  sms:      { label: "SMS",      icon: "sms",    bg: "#e3f2fd", color: "#1565c0" },
  voiceCall:{ label: "Voice",    icon: "call",   bg: "#f3e5f5", color: "#6a1b9a" },
  email:    { label: "Email",    icon: "mail",   bg: "#fff3e0", color: "#e65100" },
};

const conversations = mockLeads.slice(0, 5).map((lead) => {
  const msgs = mockMessages.filter((m) => m.leadId === lead._id);
  const last = msgs[msgs.length - 1];
  return { lead, messages: msgs, lastMessage: last, unread: msgs.length > 0 ? Math.floor(Math.random() * 3) : 0 };
}).filter((c) => c.messages.length > 0);

export default function Inbox() {
  const [active, setActive] = useState(conversations[0]);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState(active?.messages || []);
  const [showTranscript, setShowTranscript] = useState(false);
  const [channel, setChannel] = useState("whatsapp");

  const createMessageMutation = useMutation(api.messages.create);

  function selectConv(conv) {
    setActive(conv);
    setMessages(conv.messages);
    setShowTranscript(false);
  }

  async function sendMessage() {
    if (!inputVal.trim()) return;
    const msg = {
      _id: `new-${Date.now()}`,
      leadId: active.lead._id,
      channel,
      content: inputVal,
      direction: "outbound",
      createdAt: Date.now(),
    };
    if (createMessageMutation) {
      await createMessageMutation({ leadId: active.lead._id, channel, content: inputVal, direction: "outbound" });
    }
    setMessages((p) => [...p, msg]);
    setInputVal("");
  }

  return (
    <div className="h-full p-4 overflow-hidden">
    <div className="flex bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm h-full">

      {/* ── Panel 1: Conversation list ── */}
      <div className="w-72 flex-shrink-0 border-r border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30">
          <h2 className="text-sm font-bold text-on-background mb-3">Inbox</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low focus:outline-none"
            />
          </div>
        </div>

        {/* Channel filter tabs */}
        <div className="flex border-b border-outline-variant/30">
          {["All", "WhatsApp", "SMS", "Voice"].map((t) => (
            <button key={t} className="flex-1 py-2 text-[10px] font-semibold text-on-surface-variant hover:text-on-background transition-colors">
              {t}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.map((conv) => {
            const isActive = active?.lead._id === conv.lead._id;
            const ch = CHANNEL_BADGE[conv.lastMessage?.channel] || CHANNEL_BADGE.whatsapp;
            return (
              <div
                key={conv.lead._id}
                onClick={() => selectConv(conv)}
                className="flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-outline-variant/20"
                style={{ backgroundColor: isActive ? "#f2f4f6" : "#fff" }}
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={conv.lead.name} size="md" />
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: "#e53935" }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-on-background truncate">{conv.lead.name}</p>
                    <p className="text-[9px] text-on-surface-variant flex-shrink-0 ml-1">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs" style={{ color: ch.color }}>{ch.icon}</span>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {conv.lastMessage?.direction === "outbound" ? "You: " : ""}
                      {conv.lastMessage?.content.substring(0, 35)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: ch.bg, color: ch.color }}
                    >
                      {ch.label}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {conv.lead.visaType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Panel 2: Chat window ── */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/30 bg-white">
            <div className="flex items-center gap-3">
              <Avatar name={active.lead.name} size="md" />
              <div>
                <p className="text-sm font-bold text-on-background">{active.lead.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-on-surface-variant">{active.lead.phone}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    {active.lead.visaType}
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: "#e6faf7", color: "#00a884" }}
                  >
                    {active.lead.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={showTranscript
                  ? { backgroundColor: "#001b44", color: "#fff" }
                  : { backgroundColor: "#f2f4f6", color: "#434750", border: "1px solid #c4c6d2" }}
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Voice Transcript
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
                <span className="material-symbols-outlined text-sm">folder_shared</span>
                Open Case
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar" style={{ backgroundColor: "#f2f4f6" }}>
            {/* Voice call transcript card */}
            {showTranscript && (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-4 mb-2 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f3e5f5" }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: "#6a1b9a" }}>call</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-background">AI Voice Call — 4m 32s</p>
                    <p className="text-[10px] text-on-surface-variant">Completed · Today 2:45 PM</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>Completed</span>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3 font-mono text-[10px] text-on-surface-variant leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {VOICE_TRANSCRIPT}
                </div>
                <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: "#e6faf7" }}>
                  <p className="text-[10px] font-bold" style={{ color: "#00a884" }}>AI SUMMARY</p>
                  <p className="text-xs mt-0.5" style={{ color: "#065f46" }}>Applicant confirmed employment at Infosys &amp; IELTS 7.5. Positive intent. Counsellor follow-up scheduled.</p>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isOut = msg.direction === "outbound";
              return (
                <div key={msg._id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs">
                    <div className={`px-4 py-2.5 text-sm ${isOut ? "bubble-out" : "bubble-in"}`}>
                      {msg.content}
                    </div>
                    {msg.aiInsight && (
                      <div className="mt-1.5 px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "#001b44", color: "#90bafd" }}>
                        <span className="font-bold" style={{ color: "#00daf3" }}>✦ AI INSIGHT: </span>
                        {msg.aiInsight}
                      </div>
                    )}
                    <p className="text-[10px] text-on-surface-variant mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick reply chips */}
          <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-outline-variant/30 bg-white">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => setInputVal(r)}
                className="flex-shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:text-on-background hover:border-secondary transition-all"
              >
                {r}
              </button>
            ))}
          </div>

          {/* Message input */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-outline-variant/30 bg-white">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface-container-low text-on-surface-variant focus:outline-none"
            >
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="sms">📱 SMS</option>
              <option value="email">✉️ Email</option>
            </select>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message… (try /ai for AI commands)"
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-surface-container-low"
            />
            <button
              onClick={sendMessage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#001b44" }}
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant">chat</span>
            <p className="text-sm mt-2">Select a conversation to begin</p>
          </div>
        </div>
      )}

      {/* ── Panel 3: Applicant context ── */}
      {active && (
        <div className="w-64 flex-shrink-0 border-l border-outline-variant/30 flex flex-col overflow-y-auto no-scrollbar bg-surface-container-low">
          <div className="p-4 border-b border-outline-variant/30 bg-white">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Applicant Context</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Profile */}
            <div className="text-center">
              <Avatar name={active.lead.name} size="lg" className="mx-auto" />
              <p className="text-sm font-bold text-on-background mt-2">{active.lead.name}</p>
              <p className="text-xs text-on-surface-variant">{active.lead.visaType} · {active.lead.country}</p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-3 space-y-2 border border-outline-variant/20">
              {[
                { label: "AI Score",  value: active.lead.aiScore ? `${active.lead.aiScore}/100` : "—", icon: "psychology" },
                { label: "Source",    value: active.lead.source,                                        icon: "source" },
                { label: "Budget",    value: active.lead.budget ? `₹${(active.lead.budget/1000).toFixed(0)}k` : "—", icon: "payments" },
                { label: "Status",    value: active.lead.status,                                        icon: "info" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">{f.icon}</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant">{f.label}</p>
                    <p className="text-xs font-semibold text-on-background capitalize">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>colors_spark</span>
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">AI Insight</p>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "#90bafd" }}>
                High conversion likelihood. Recommend scheduling a consultation call within 24 hours.
              </p>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quick Actions</p>
              {[
                { label: "View Full Case",    icon: "folder_shared" },
                { label: "Send Document List", icon: "checklist" },
                { label: "Schedule Call",      icon: "event" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-outline-variant/30 text-on-background hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
