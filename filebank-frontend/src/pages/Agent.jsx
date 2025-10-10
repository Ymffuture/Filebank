import React, { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

// --- SOCKET SERVER URL ---
const SOCKET_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_URL) ||
  "https://filebankserver.onrender.com";

// Unique message id
const uid = () =>
  "m_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(3);

function ChatMessage({ m }) {
  const isUser = m.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
        } shadow-sm`}
      >
        <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
        <div className="text-[11px] opacity-60 mt-1 text-right">
          {m.status === "pending" ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> sending...
            </span>
          ) : (
            <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const pushMessage = useCallback((m) => {
    setMessages((s) => [...s, m]);
    setTimeout(scrollToBottom, 30);
  }, []);

  // --- SOCKET CONNECTION ---
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      pushMessage({
        id: uid(),
        from: "agent",
        text: "Connected to live agent support. How can we help you today?",
        status: "done",
      });
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("live:message", (msg) => pushMessage({ ...msg, status: "done" }));

    return () => {
      socket.disconnect();
    };
  }, [pushMessage]);

  // --- SEND MESSAGE ---
  const handleSend = (e) => {
    e.preventDefault();
    const payload = text.trim();
    if (!payload || !connected) return;

    const message = {
      id: uid(),
      from: "user",
      text: payload,
      status: "pending",
      createdAt: Date.now(),
    };

    pushMessage(message);
    setText("");

    socketRef.current.emit("live:message", { text: payload }, (ack) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, status: ack?.ok ? "done" : "error" }
            : m
        )
      );
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            FA
          </div>
          <div>
            <div className="text-sm font-semibold">Famacloud Live Support</div>
            <div className="text-xs text-gray-500">
              {connected ? "Agent online" : "Connecting..."}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <div className="mb-2 font-semibold">Start chatting with our support</div>
              <div className="text-sm">Type your message below to connect with a live agent.</div>
            </div>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} m={m} />
          ))}
        </div>
      </main>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <TextareaAutosize
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type your message..." : "Connecting to live support..."}
            minRows={1}
            maxRows={4}
            disabled={!connected}
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          <button
            type="submit"
            disabled={!connected || !text.trim()}
            className={`inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl ${
              !connected ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            <Send className="h-4 w-4" />
            <span className="text-sm">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

