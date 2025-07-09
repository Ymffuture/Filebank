import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Switch, Tooltip, Typography } from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';

const { Text } = Typography;

SyntaxHighlighter.registerLanguage('javascript', js);

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to **FileBank AI Assistant**!\n\nAsk me anything about FileBank.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [botTypingText, setBotTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, botTypingText]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message: input });
      const fullReply = res.data.reply;

      setIsTyping(true);
      let current = '';
      let i = 0;

      const typeInterval = setInterval(() => {
        current += fullReply[i];
        setBotTypingText(current);
        i++;
        if (i >= fullReply.length) {
          clearInterval(typeInterval);
          setMessages(prev => [...prev, { from: 'bot', text: fullReply }]);
          setBotTypingText('');
          setIsTyping(false);
        }
      }, 20);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: '⚠️ Error contacting AI.' }]);
      setIsTyping(false);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const highlightKeywords = (text) => {
    return text
      .replace(/\bmap\(\)/g, '<code style="color:#1677ff;background:#f0f5ff;padding:2px 4px;border-radius:4px;">map()</code>')
      .replace(/\bfilter\(\)/g, '<code style="color:#52c41a;background:#f6ffed;padding:2px 4px;border-radius:4px;">filter()</code>')
      .replace(/\breduce\(\)/g, '<code style="color:#fa8c16;background:#fff7e6;padding:2px 4px;border-radius:4px;">reduce()</code>');
  };

  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <div key={`${idx}-code-${i}`} className="relative group my-2 animate-fade-in">
            <SyntaxHighlighter
              language="javascript"
              showLineNumbers={true}
              style={darkMode ? atomOneDark : atomOneLight}
              customStyle={{ borderRadius: 8, fontSize: 14 }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copy(part.trim())}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                aria-label="Copy code"
              />
            </Tooltip>
          </div>
        );
      } else {
        const html = highlightKeywords(
          part
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
        );

        return (
          <div
            key={`${idx}-text-${i}`}
            className={`my-2 p-3 rounded-lg max-w-[80%] whitespace-pre-wrap break-words text-[15px] leading-relaxed shadow-md animate-fade-in ${
              msg.from === 'user'
                ? 'bg-[#333] text-white self-end ml-auto'
                : 'bg-sky-100 text-[#333] dark:bg-gray-700 dark:text-white'
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    });
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-gradient-to-br from-sky-100 to-white dark:from-gray-800 dark:to-gray-900`}>
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold text-[#333] dark:text-white">FileBank AI</h1>
        <Space>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            aria-label="Toggle dark mode"
          />
        </Space>
      </header>

      <main ref={containerRef} className="flex-1 overflow-auto p-4 flex flex-col space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            {renderMessage(msg, idx)}
          </div>
        ))}

        {/* 🔥 Typing Effect Preview */}
        {isTyping && (
  <div className="flex flex-col">
    {renderMessage({ from: 'bot', text: botTypingText }, 'typing')}

    {/* Animated typing dots */}
    <div className="my-2 p-3 rounded-lg max-w-[80%] bg-sky-100 dark:bg-gray-700 dark:text-white text-sm font-medium flex items-center gap-2">
      <span>Typing...</span>
      <span className="dot-flash animate-blink">.</span>
      <span className="dot-flash animate-blink delay-200">.</span>
      <span className="dot-flash animate-blink delay-400">.</span>
    </div>
  </div>
)}

      </main>

      <footer className="p-4 bg-white dark:bg-gray-800 gap-3 flex">
        <div className="w-full flex gap-3 ">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 rounded px-4 py-6 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
            aria-label="Ask filebank Al..."
          />
          <Button
            type="link"
            onClick={sendMessage}
            className="rounded-r-full px-4 py-2 bg-[#555] hover:bg-[#333] text-white"
            aria-label="Send message"
          >
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}

