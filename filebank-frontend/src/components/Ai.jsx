import React, { useState } from "react";
import { Button, Input, Modal, Tooltip } from "antd";
import { MessageOutlined, CopyOutlined } from "@ant-design/icons";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import api from "../api/fileApi";

SyntaxHighlighter.registerLanguage("javascript", js);

const ChatBotModal = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m FamaAI, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post("/chat", { message: input });
      setMessages([...newMessages, { from: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Sorry, famacloud AI is currently unreachable.", type: "error" },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);

    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <div key={i} className="relative">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneLight}
              customStyle={{
                borderRadius: 8,
                fontSize: 13,
                margin: "8px 0",
                background: "#f6f8fa",
                paddingRight: "32px",
              }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
              <Button
                size="small"
                shape="circle"
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(part.trim())}
                style={{ position: "absolute", top: 8, right: 8 }}
              />
            </Tooltip>
          </div>
        );
      }

      const html = part
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/(?:<br\s*\/?>|\n)/g, "<br/>");

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap break-words shadow ${
            msg.from === "user"
              ? "bg-gradient-to-r from-[#202124] to-[#3a3b3c] text-white ml-auto"
              : msg.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-black"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={() => setVisible(true)}
        className="!fixed bottom-6 left-6 z-[999] !w-14 !h-14 !flex !items-center !justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #202124, #5c2a2a)",
          border: "none",
        }}
      />

      {/* Chat Modal */}
      <Modal
        title={
          <div className="bg-[#202124] text-white px-4 py-2 rounded">
            💬 FamaAI Assistant
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={520}
        style={{ top: 30 }}
        bodyStyle={{ padding: 0, background: "#fafafa" }}
      >
        <div className="flex flex-col h-[70vh]">
          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {renderMessage(msg, idx)}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="border-t p-2 bg-white flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
              className="rounded-full px-4 py-2"
            />
            <Button
              type="primary"
              shape="circle"
              icon={<ArrowUp size={18} />}
              loading={loading}
              onClick={sendMessage}
              style={{
                background: "linear-gradient(135deg, #202124, #5c2a2a)",
                border: "none",
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChatBotModal;

