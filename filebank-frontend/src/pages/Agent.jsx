// SmartWhatsAppChat.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Zap,
  Users,
  Phone,
  PaperPlane,
  Loader2,
  X,
  Check,
} from "lucide-react";

/**
 * SmartWhatsAppChat
 * - Dual-mode chat: AI assistant + Live agent handoff (WhatsApp or future websocket).
 * - Accessibility: aria labels, keyboard send, focus management.
 *
 * Props (optional):
 * - whatsappNumber: e.g. "27634414863"
 * - initialSystemPrompt: string
 */
export default function SmartWhatsAppChat({
  whatsappNumber = "27634414863",
  initialSystemPrompt = "You are Famacloud assistant — helpful, concise, polite.",
}) {
  const [mode, setMode] = useState("ai"); // 'ai' | 'human'
  const [messages, setMessages] = useState(() => [
    {
      id: id(),
      author: "system",
      text: initialSystemPrompt,
      ts: Date.now(),
    },
    {
      id: id(),
      author: "assistant",
      text: "Hi 👋 I’m Famacloud Assistant. Ask me anything or switch to a live agent.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // simulating agent connection
  const [agentConnected, setAgentConnected] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // scroll to bottom when messages change
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // send message handler
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim()) return;
      const userMsg = { id: id(), author: "user", text: text.trim(), ts: Date.now() };
      setMessages((m) => [...m, userMsg]);
      setInput("");

      if (mode === "ai") {
        simulateAiReply(userMsg.text);
      } else {
        // human mode - would send to your live agent queue or server
        simulateHumanRelay(userMsg.text);
      }
    },
    [mode]
  );

  // keyboard: Enter to send, Shift+Enter for newline
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Simulated AI reply (replace with real fetch to AI endpoint)
  const simulateAiReply = (prompt) => {
    setIsTyping(true);
    // small "thinking" delay, then "typing"
    setTimeout(() => {
      // progressively append typing text to simulate streaming
      const replyText = generateAiReply(prompt);
      let progressive = "";
      const chars = replyText.split("");
      let i = 0;
      const stream = setInterval(() => {
        i++;
        progressive = chars.slice(0, i).join("");
        // replace the last assistant typing message
        setMessages((prev) => {
          // remove any temp typing placeholder
          const withoutTyping = prev.filter((m) => m.author !== "assistant_temp");
          return [
            ...withoutTyping,
            { id: "assistant_temp", author: "assistant_temp", text: progressive, ts: Date.now() },
          ];
        });

        if (i >= chars.length) {
          clearInterval(stream);
          // cleanup placeholder and push final assistant message
          setMessages((prev) => {
            const removed = prev.filter((m) => m.author !== "assistant_temp");
            return [...removed, { id: id(), author: "assistant", text: replyText, ts: Date.now() }];
          });
          setIsTyping(false);
        }
      }, 20);
    }, 500);
  };

  // Simulate sending to human relay, then optional confirmation
  const simulateHumanRelay = (text) => {
    // In a real setup you'd POST to /api/live/send or push to websocket
    setMessages((m) => [
      ...m,
      { id: id(), author: "system", text: "Message sent to live agent queue. Waiting for agent...", ts: Date.now() },
    ]);
  };

  // "Switch to live agent" flow:
  const requestLiveAgent = () => {
    setIsConnecting(true);
    // Simulate either "connect to an available agent" or fallback to WhatsApp
    // For real: call backend to enqueue user, return agent availability
    setTimeout(() => {
      const agentAvailable = Math.random() > 0.35; // 65% chance immediate agent available (simulate)
      setIsConnecting(false);
      if (agentAvailable) {
        setAgentConnected(true);
        setMode("human");
        setMessages((m) => [
          ...m,
          { id: id(), author: "system", text: "Live agent joined the chat.", ts: Date.now() },
          { id: id(), author: "agent", text: "Hello — I’m here to help. What can I do for you?", ts: Date.now() },
        ]);
        // focus input
        inputRef.current?.focus();
      } else {
        // fallback: open WhatsApp with prefilled context
        const last = messages.filter((x)=>x.author === "user").slice(-1)[0];
        const message = encodeURIComponent(
          `Hi, I want to speak to a live agent about: ${last?.text || "support"}`
        );
        const url = `https://wa.me/${whatsappNumber}?text=${message}`;
        window.open(url, "_blank", "noopener");
      }
    }, 1300);
  };

  // simple AI reply generator (placeholder)
  function generateAiReply(prompt) {
    // keep it short and relevant — you'd call your LLM here
    if (/price|cost|charge/i.test(prompt)) {
      return "Pricing depends on your plan — I can show available plans or connect you to a human for custom quotes.";
    }
    if (/upload|file/i.test(prompt)) {
      return "You can upload files via the Files tab. Want me to walk you through uploads or connect to an agent?";
    }
    return `I understood: "${prompt}". I can help with steps, generate templates, or escalate to a live agent if you prefer.`;
  }

  // memoized human-friendly grouped messages for rendering
  const renderedMessages = useMemo(() => messages, [messages]);

  return (
    <div className="max-w-5xl mx-auto h-[92vh] rounded-2xl overflow-hidden shadow-lg grid grid-cols-12 bg-white">
      {/* Sidebar */}
      <aside className="col-span-3 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-2">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm opacity-80">Support</div>
            <div className="font-semibold text-lg">Famacloud Chat</div>
          </div>
        </div>

        <div className="flex-1 text-sm space-y-4">
          <div className="p-3 rounded-lg bg-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs">Mode</div>
              <div className="text-xs font-semibold">{mode === "ai" ? "AI Assistant" : agentConnected ? "Live Agent" : "Human Mode"}</div>
            </div>
            <div className="mt-2 text-xs">Quick answers from the assistant — switch to a real person anytime.</div>
          </div>

          <div className="p-3 rounded-lg bg-white/8">
            <div className="text-xs font-semibold">Agent Benefits</div>
            <ul className="mt-2 text-xs space-y-2">
              <li className="flex items-center gap-2"><Zap className="w-4 h-4" /> Fast responses</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> Live escalation</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4" /> Verified agents</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-white/8 flex flex-col gap-2">
            <div className="text-xs font-semibold">Contact</div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Support
            </a>
            <button
              onClick={() => {
                // quick toggle mode
                if (mode === "ai") {
                  requestLiveAgent();
                } else {
                  setMode("ai");
                  setAgentConnected(false);
                  setMessages((m)=>[...m,{ id: id(), author: "system", text: "Switched to AI assistant.", ts: Date.now() }]);
                }
              }}
              className="mt-2 py-2 px-3 rounded-md bg-white text-indigo-700 font-medium hover:bg-white/90"
              aria-pressed={mode === "human"}
            >
              {mode === "ai" ? "Request Live Agent" : "Switch to AI"}
            </button>

            {isConnecting && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting to live agent...
              </div>
            )}
          </div>
        </div>

        <div className="text-xs opacity-80">
          <div>Secure · Private · 24/7 AI</div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="col-span-9 flex flex-col bg-neutral-50">
        {/* header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-semibold">Famacloud Assistant</div>
              <div className="text-xs text-gray-500">{mode === "ai" ? "AI powered support" : agentConnected ? "You’re chatting with an agent" : "Human queue"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {agentConnected ? (
              <div className="inline-flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" /> Agent connected
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" /> {mode === "ai" ? "AI" : "Waiting"}
              </div>
            )}
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => {
                // quick clear history
                setMessages([]);
              }}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>

        {/* messages list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ background: "linear-gradient(180deg,#f8fafc,#ffffff)" }}
        >
          {renderedMessages.length === 0 && (
            <div className="text-center text-sm text-gray-500">No messages yet — say hi 👋</div>
          )}

          {renderedMessages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Zap className="w-4 h-4" />
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm max-w-[70%]">
                <div className="flex items-center gap-1 animate-pulse text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Assistant is typing...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* composer */}
        <div className="px-6 py-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // quick toggle mode (shortcut)
                  if (mode === "ai") requestLiveAgent();
                  else {
                    setMode("ai");
                    setAgentConnected(false);
                    setMessages((m)=>[...m,{ id: id(), author: "system", text: "Switched to AI assistant.", ts: Date.now() }]);
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs">{mode === "ai" ? "AI" : "Human"}</span>
              </button>
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={agentConnected ? "Message the agent..." : "Ask the assistant or request a live agent..."}
              className="flex-1 resize-none rounded-2xl px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={1}
              aria-label="Chat message"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // quick attach (not implemented)
                  alert("Attachment placeholder");
                }}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Attach"
              >
                <PaperPlane className="w-5 h-5 transform rotate-45 text-indigo-500" />
              </button>

              <button
                onClick={() => sendMessage(input)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                aria-label="Send message"
                disabled={!input.trim()}
              >
                <PaperPlane className="w-4 h-4" />
                <span className="text-sm">{agentConnected ? "Send" : "Send"}</span>
              </button>
            </div>
          </div>

          {/* small helper row */}
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <div>
              <span className="font-semibold">Tip:</span> Press Enter to send • Shift+Enter for newline
            </div>
            <div>
              <button
                onClick={() => {
                  // fallback connect via WhatsApp with last user message
                  const last = messages.filter((x)=>x.author === "user").slice(-1)[0];
                  const message = encodeURIComponent(`Hi, I need assistance: ${last?.text || "support"}`);
                  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");
                }}
                className="text-indigo-600 underline text-xs"
              >
                Connect via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* small utility components & helpers */

function MessageBubble({ msg }) {
  // msg.author: 'user' | 'assistant' | 'agent' | 'system'
  const isUser = msg.author === "user";
  const isAgent = msg.author === "agent";
  const isSystem = msg.author === "system";
  const AuthorIcon = isUser ? null : isAgent ? Users : Zap;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm text-indigo-600">
          <AuthorIcon className="w-4 h-4" />
        </div>
      )}

      <div className={`${isUser ? "text-right" : "text-left"} max-w-[70%]`}>
        {isSystem ? (
          <div className="text-xs text-gray-500 italic">{msg.text}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${isUser ? "bg-indigo-600 text-white" : "bg-white text-gray-800"}`}
          >
            <div className="whitespace-pre-wrap break-words">{msg.text}</div>
            <div className="text-[10px] mt-1 opacity-60">{new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </motion.div>
        )}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
          </svg>
        </div>
      )}
    </div>
  );
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
}

