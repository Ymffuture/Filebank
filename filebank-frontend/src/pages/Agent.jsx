import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { Send, Loader2 } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://filebankserver.onrender.com";

const uid = () => "m_" + Math.random().toString(36).slice(2, 9);

function ChatMessage({ m }) {
  const isUser = m.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
          isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {m.text}
      </div>
    </div>
  );
}

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const listRef = useRef(null);

  // connect socket
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("live:message", (msg) => {
      setMessages((prev) => [...prev, { ...msg, from: "agent" }]);
    });

    socket.on("agent:typing", ({ isTyping }) => {
      setAgentTyping(isTyping);
      if (isTyping) {
        setTimeout(() => setAgentTyping(false), 3000); // auto-hide after 3s
      }
    });

    return () => socket.disconnect();
  }, []);

  const handleSend = useCallback(() => {
    const payload = text.trim();
    if (!payload || !socketRef.current?.connected) return;
    const msg = { id: uid(), from: "user", text: payload };
    setMessages((prev) => [...prev, msg]);
    setText("");
    socketRef.current.emit("live:message", msg);
  }, [text]);

  // Scroll on new message
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, agentTyping]);

  // Emit user typing
  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (!socketRef.current) return;
    socketRef.current.emit("user:typing", { isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("user:typing", { isTyping: false });
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div className="text-sm font-semibold">Live Support Chat</div>
        <div
          className={`text-xs font-medium ${
            connected ? "text-green-600" : "text-red-500"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </div>
      </header>

      {/* Messages */}
      <main ref={listRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((m) => (
            <ChatMessage key={m.id} m={m} />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {agentTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 text-xs italic mt-2 ml-3"
              >
                Agent is typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t"
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <TextareaAutosize
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            minRows={1}
            maxRows={4}
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

