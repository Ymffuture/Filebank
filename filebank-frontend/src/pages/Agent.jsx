// ChatRoom.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  Users,
  Sparkles,
  Loader2,
  Mail,
  Check,
  X,
} from "lucide-react";
import api from "../api/fileApi"; // your axios instance
// Ensure you have REACT_APP_SOCKET_URL in env when using live mode

// Minimal message id generator
const uid = () =>
  "m_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(3);

function ChatMessage({ m }) {
  const isUser = m.from === "user";
  const isAgent = m.from === "agent";
  const isAI = m.from === "ai";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      aria-live={isUser ? "polite" : "polite"}
    >
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
  const listRef = useRef(null);

  // memoized conversation ID for AI (persist across re-renders)
  const conversationId = useRef(uid()).current;

  // helper: append message
  const pushMessage = useCallback((m) => {
    setMessages((s) => [...s, m]);
    // auto-scroll
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // AI chat handler
  const sendAiMessage = useCallback(
    async (payloadText) => {
      if (!payloadText?.trim()) return;
      const tempId = uid();
      const tempMsg = {
        id: tempId,
        from: "user",
        text: payloadText,
        status: "sent",
        createdAt: Date.now(),
      };
      pushMessage(tempMsg);

      // placeholder for AI response (optimistic)
      const aiId = uid();
      const aiTemp = {
        id: aiId,
        from: "ai",
        text: "Thinking...",
        status: "pending",
        createdAt: Date.now(),
      };
      pushMessage(aiTemp);

      setLoadingAi(true);
      try {
        const res = await api.post("/chat", {
          message: payloadText,
          conversationId,
          mode: "ai",
        });
        // backend should return { id, text }
        const aiText = res.data?.text ?? res.data?.data?.text ?? "No response";
        // update the ai message
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: aiText, status: "done" } : m))
        );
      } catch (err) {
        console.error("AI chat error", err);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: "Failed to get response", status: "error" } : m))
        );
      } finally {
        setLoadingAi(false);
      }
    },
    [conversationId, pushMessage]
  );

  // Live (socket) handlers
  const connectSocket = useCallback(() => {
    if (!process.env.REACT_APP_SOCKET_URL) {
      console.warn("REACT_APP_SOCKET_URL not set");
      return;
    }
    if (socketRef.current) return;

    const socket = io(process.env.REACT_APP_SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token: localStorage.getItem("chat_token") || null },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // register/join room
      socket.emit("join", { email: email || `anon-${conversationId}` });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("live:message", (msg) => {
      // msg: { id, from, text, createdAt }
      pushMessage({ ...msg, status: "done" });
    });

    socket.on("agent:typing", ({ isTyping }) => {
      // optional: show typing indicator
      // add a ephemeral message or state
    });

    socket.open();
  }, [email, conversationId, pushMessage]);

  const disconnectSocket = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // toggle mode: if switching to live and not verified, open register modal
  useEffect(() => {
    if (mode === "live") {
      if (!isVerified) {
        setRegisterOpen(true);
        // don't connect yet until verified
      } else {
        connectSocket();
      }
    } else {
      disconnectSocket();
    }
    // cleanup on unmount
    return () => {
      // don't disconnect here to allow re-entry; leave it safe
    };
  }, [mode, isVerified, connectSocket, disconnectSocket]);

  // send live message via socket
  const sendLiveMessage = async (payloadText) => {
    if (!socketRef.current || !connected) {
      pushMessage({
        id: uid(),
        from: "ai", // system info
        text: "Not connected to live support. Try again or switch to AI.",
        status: "error",
      });
      return;
    }
    const m = { id: uid(), from: "user", text: payloadText, status: "sent", createdAt: Date.now() };
    pushMessage(m);
    // emit to socket
    socketRef.current.emit("live:message", { text: payloadText }, (ack) => {
      // optional ack handling
      if (ack?.ok) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "done" } : x)));
      } else if (ack?.error) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "error" } : x)));
      }
    });
  };

  // unified send handler
  const handleSend = async (e) => {
    e?.preventDefault?.();
    const payload = text.trim();
    if (!payload) return;
    setText("");
    if (mode === "ai") {
      await sendAiMessage(payload);
    } else {
      await sendLiveMessage(payload);
    }
  };

  // Registration & verification flows
  const registerEmail = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      pushMessage({ id: uid(), from: "ai", text: "Please enter a valid email", status: "error" });
      return;
    }
    try {
      await api.post("/auth/register", { email });
      localStorage.setItem("chat_email", email);
      setRegisterOpen(true); // show verify
      pushMessage({ id: uid(), from: "ai", text: "Verification code sent to your email", status: "done" });
    } catch (err) {
      console.error("register error", err);
      pushMessage({ id: uid(), from: "ai", text: "Failed to register email", status: "error" });
    }
  };

  const verifyEmail = async () => {
    try {
      const res = await api.post("/auth/verify-email", { email, code: verifCode });
      // backend may return token
      const token = res.data?.token || res.data?.data?.token;
      if (token) localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_verified", "1");
      setIsVerified(true);
      setRegisterOpen(false);
      pushMessage({ id: uid(), from: "ai", text: "Email verified — connecting you to live agents...", status: "done" });
      connectSocket();
    } catch (err) {
      console.error("verify error", err);
      pushMessage({ id: uid(), from: "ai", text: "Verification failed. Check your code.", status: "error" });
    }
  };

  // helper: quickly switch mode UI-friendly
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

  // keyboard submit: press Enter to send, Shift+Enter for newline
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

          {messages.map((m) => <ChatMessage key={m.id} m={m} />)}
        </div>
      </main>

      {/* composer */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "ai" ? "Ask AI (press Enter to send)" : "Chat with a real person..."}
            rows={1}
            className="flex-1 resize-none border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Message input"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl"
            aria-label="Send message"
            disabled={mode === "ai" ? loadingAi : (mode === "live" && !connected)}
          >
            {mode === "ai" && loadingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="text-sm">{mode === "ai" ? (loadingAi ? "Thinking..." : "Send") : (connected ? "Send" : "Connect")}</span>
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
                  {connected ? "Connected" : isVerified ? "Connecting..." : "Not verified"}
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

      {/* registration / verify modal (simple inline modal) */}
      {registerOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
          >
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
                <p className="text-sm text-gray-600 mb-4">Enter your email to receive a verification code for live chat access.</p>
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
                    onClick={() => {
                      // If user already got code, show verify input
                      // Keep modal open so they can enter code
                    }}
                  >
                    I have code
                  </button>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Verification code</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="123456"
                      value={verifCode}
                      onChange={(e) => setVerifCode(e.target.value)}
                    />
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      onClick={verifyEmail}
                    >
                      Verify
                    </button>
                  </div>
                </div>
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

