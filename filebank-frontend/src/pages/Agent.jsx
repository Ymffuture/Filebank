import React, { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  Users,
  Sparkles,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import api from "../api/fileApi";

// --- ENV: works for CRA (REACT_APP_*) and Vite (VITE_*) ---
const SOCKET_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SOCKET_URL) ||
  'https://filebankserver.onrender.com' ||
  `${window.location.origin}`;

// Minimal message id generator
const uid = () =>
  "m_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(3);

function ChatMessage({ m }) {
  const isUser = m.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`} aria-live="polite">
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
        } shadow-sm`}
      >
        <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
        <div className="text-[11px] opacity-60 mt-1 text-right">
          {m.status === "pending" ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> sending...
            </span>
          ) : m.status === "error" ? (
            <span className="text-red-500">failed</span>
          ) : (
            <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatRoom() {
  // UI & state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("ai"); // 'ai' or 'live'
  const [loadingAi, setLoadingAi] = useState(false);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem("chat_email") || "");
  const [isVerified, setIsVerified] = useState(() => !!localStorage.getItem("chat_verified"));
  const [verifCode, setVerifCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const listRef = useRef(null);

  const conversationId = useRef(uid()).current;

  const pushMessage = useCallback((m) => {
    setMessages((s) => [...s, m]);
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 30);
  }, []);

  // ---------------- AI CHAT ----------------
  const sendAiMessage = useCallback(
    async (payloadText) => {
      if (!payloadText?.trim()) return;

      const tempId = uid();
      pushMessage({
        id: tempId,
        from: "user",
        text: payloadText,
        status: "sent",
        createdAt: Date.now(),
      });

      const aiId = uid();
      pushMessage({
        id: aiId,
        from: "ai",
        text: "Thinking...",
        status: "pending",
        createdAt: Date.now(),
      });

      setLoadingAi(true);
      try {
        const res = await api.post("/chat", {
          message: payloadText,
          conversationId,
          mode: "ai",
        });
        const aiText = res?.data?.text ?? res?.data?.data?.text ?? "No response";
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: aiText, status: "done" } : m))
        );
      } catch (err) {
        console.error("AI chat error", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, text: "Failed to get response", status: "error" } : m
          )
        );
      } finally {
        setLoadingAi(false);
      }
    },
    [conversationId, pushMessage]
  );

  // ---------------- LIVE CHAT (SOCKET) ----------------
  const connectSocket = useCallback(() => {
    if (!SOCKET_URL) {
      console.warn("SOCKET_URL env not set");
      pushMessage({ id: uid(), from: "ai", text: "Socket URL not configured.", status: "error" });
      return;
    }
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token: localStorage.getItem("chat_token") || null },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { email: email || `anon-${conversationId}` });
      pushMessage({
        id: uid(),
        from: "ai",
        text: "Connected to live support.",
        status: "done",
      });
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      console.warn("socket disconnect:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("socket connect_error:", err);
      pushMessage({
        id: uid(),
        from: "ai",
        text: `Live chat failed to connect (${err?.message || "error"})`,
        status: "error",
      });
    });

    socket.on("live:message", (msg) => {
      pushMessage({ ...msg, status: "done" });
    });

    socket.on("agent:typing", ({ isTyping }) => {
      // Implement typing indicator if desired
    });

    socket.open();
  }, [email, conversationId, pushMessage]);

  const disconnectSocket = useCallback(() => {
    try {
      socketRef.current?.disconnect();
    } finally {
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Toggle mode: connect live only if verified
  useEffect(() => {
    if (mode === "live") {
      if (!isVerified) {
        setRegisterOpen(true);
      } else {
        connectSocket();
      }
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [mode, isVerified, connectSocket, disconnectSocket]);

  const sendLiveMessage = async (payloadText) => {
    if (!payloadText?.trim()) return;

    if (!socketRef.current || !connected) {
      if (!isVerified) {
        setRegisterOpen(true);
        return;
      }
      connectSocket();
      return;
    }

    const m = {
      id: uid(),
      from: "user",
      text: payloadText,
      status: "sent",
      createdAt: Date.now(),
    };
    pushMessage(m);

    socketRef.current.emit("live:message", { text: payloadText }, (ack) => {
      if (ack?.ok) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "done" } : x)));
      } else if (ack?.error) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "error" } : x)));
      }
    });
  };

  // Unified send
  const handleSend = async (e) => {
    e?.preventDefault?.();
    const payload = text.trim();
    if (!payload && mode === "ai") return;
    if (mode === "ai") {
      setText("");
      await sendAiMessage(payload);
    } else {
      if (!connected) {
        if (!isVerified) {
          setRegisterOpen(true);
        } else {
          connectSocket();
        }
        return;
      }
      setText("");
      await sendLiveMessage(payload);
    }
  };

  // ---------------- REGISTRATION / VERIFY ----------------
  const registerEmail = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      pushMessage({ id: uid(), from: "ai", text: "Please enter a valid email", status: "error" });
      return;
    }
    try {
      await api.post("/auth/register", { email });
      localStorage.setItem("chat_email", email);
      setShowCodeInput(true);
      pushMessage({
        id: uid(),
        from: "ai",
        text: "Verification code sent to your email",
        status: "done",
      });
    } catch (err) {
      console.error("register error", err);
      pushMessage({ id: uid(), from: "ai", text: "Failed to register email", status: "error" });
    }
  };

  const verifyEmail = async () => {
    try {
      const res = await api.post("/verify-email", { email, code: verifCode });
      const token = res.data?.token || res.data?.data?.token;
      if (token) localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_verified", "1");
      setIsVerified(true);
      setRegisterOpen(false);
      setShowCodeInput(false);
      pushMessage({
        id: uid(),
        from: "ai",
        text: "Email verified — connecting you to live agents...",
        status: "done",
      });
      connectSocket();
    } catch (err) {
      console.error("verify error", err);
      pushMessage({ id: uid(), from: "ai", text: "Verification failed. Check your code.", status: "error" });
    }
  };

  const ModeToggle = () => (
    <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
      <button
        className={`px-3 py-1 rounded-full ${mode === "ai" ? "bg-indigo-600 text-white" : "text-gray-600"}`}
        onClick={() => setMode("ai")}
        aria-pressed={mode === "ai"}
      >
        <Sparkles className="inline-block h-4 w-4 mr-2" />
        AI
      </button>
      <button
        className={`px-3 py-1 rounded-full ${mode === "live" ? "bg-green-600 text-white" : "text-gray-600"}`}
        onClick={() => setMode("live")}
        aria-pressed={mode === "live"}
      >
        <Users className="inline-block h-4 w-4 mr-2" />
        Live
      </button>
    </div>
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">FA</div>
          <div>
            <div className="text-sm font-semibold">Famacloud Support</div>
            <div className="text-xs text-gray-500">WhatsApp-style chat powered by AI + Live</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <button
            className="flex items-center gap-2 text-sm text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100"
            onClick={() => {
              setMessages([]);
              pushMessage({ id: uid(), from: "ai", text: "Chat cleared.", status: "done" });
            }}
            aria-label="Clear chat"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </header>

      {/* messages list */}
      <main ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <div className="mb-2 font-semibold">Start the conversation</div>
              <div className="text-sm">Ask the AI or switch to Live Chat to speak with a real person.</div>
            </div>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} m={m} />
          ))}
        </div>
      </main>

      {/* composer */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <TextareaAutosize
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "ai" ? "Ask AI (press Enter to send)" : (connected ? "Chat with a real person..." : "Connect to live support")}
            minRows={1}
            maxRows={4}
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Message input"
          />
          <button
            type="submit"
            className={`inline-flex items-center gap-2 ${
              mode === "live" && !connected ? "bg-green-600" : "bg-indigo-600"
            } text-white px-4 py-2 rounded-xl`}
            aria-label={mode === "live" && !connected ? "Connect" : "Send message"}
            disabled={mode === "ai" ? loadingAi : false}
          >
            {mode === "ai" && loadingAi ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="text-sm">
              {mode === "live" && !connected ? "Connect" : mode === "ai" ? (loadingAi ? "Thinking..." : "Send") : "Send"}
            </span>
          </button>
        </div>

        {/* connection hint */}
        <div className="max-w-2xl mx-auto mt-2 text-xs text-gray-500 flex items-center justify-between">
          <div>
            Mode: <span className="font-medium">{mode.toUpperCase()}</span>
            {mode === "live" && (
              <>
                {" • "}
                <span className={`font-medium ${connected ? "text-green-600" : "text-red-500"}`}>
                  {connected ? "Connected" : isVerified ? "Not connected" : "Not verified"}
                </span>
              </>
            )}
          </div>
          <div>
            <span className="mr-2"><Mail className="inline h-4 w-4 mr-1" /></span>
            <button
              type="button"
              className="text-indigo-600 underline text-xs"
              onClick={() => setRegisterOpen(true)}
            >
              {isVerified ? "Registered" : (email ? "Verify email" : "Register email")}
            </button>
          </div>
        </div>
      </form>

      {/* registration / verify modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div className="text-lg font-semibold">Register / Verify Email</div>
              </div>
              <button onClick={() => setRegisterOpen(false)} aria-label="Close" className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isVerified ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email to receive a verification code for live chat access.
                </p>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email"
                />
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                    onClick={registerEmail}
                  >
                    Send code
                  </button>
                  <button
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
                    onClick={() => setShowCodeInput(true)}
                  >
                    I have code
                  </button>
                </div>

                {showCodeInput && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Verification code</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder="123456"
                        value={verifCode}
                        onChange={(e) => setVerifCode(e.target.value)}
                        aria-label="Verification code"
                      />
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        onClick={verifyEmail}
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-gray-700">You're verified. Connect to live agents now.</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      connectSocket();
                      setRegisterOpen(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
