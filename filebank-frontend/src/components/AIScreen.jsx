import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Switch, Tooltip } from 'antd';
import { CopyOutlined, BulbOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';

SyntaxHighlighter.registerLanguage('javascript', js);

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to **FileBank AI**!\n\nAsk me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef(null);

  // Auto-scroll only if near the bottom
  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: input });
      setMessages((m) => [...m, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: '⚠️ Error contacting AI. Please try again.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessage = (msg) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    const alignment = msg.from === 'user' ? 'self-end' : 'self-start';
    return (
      <div className={`flex flex-col ${alignment}`}>
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            return (
              <div key={i} className="relative group my-2">
                <SyntaxHighlighter
                  language="javascript"
                  style={darkMode ? atomOneDark : atomOneLight}
                  customStyle={{ borderRadius: 6, padding: '12px' }}
                >
                  {part.trim()}
                </SyntaxHighlighter>
                <Tooltip title="Copy code">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copy(part.trim())}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy code"
                  />
                </Tooltip>
              </div>
            );
          } else {
            return (
              <div key={i} className="flex items-start space-x-2 my-2">
                {msg.from === 'bot' && <RobotOutlined className="text-xl" />}
                <div
                  className={`p-3 max-w-[70%] rounded-lg ${
                    msg.from === 'user'
                      ? 'bg-[#555] text-white right'
                      : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>'),
                  }}
                />
                {msg.from === 'user' && <UserOutlined className="text-xl" />}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">FileBank AI</h1>
        <Space>
          <Tooltip title="Toggle dark mode">
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
            />
          </Tooltip>
        </Space>
      </header>

      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2"
        aria-live="polite"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="message-enter">
            {renderMessage(msg)}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
            AI is thinking...
          </div>
        )}
      </main>

      <footer className="p-4 bg-gray-100 dark:bg-gray-800">
        <Space.Compact className="w-full">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
            disabled={loading}
            aria-label="Type your question"
          />
          <Button
            type="primary"
            loading={loading}
            onClick={sendMessage}
            aria-label="Send message"
          >
            Send
          </Button>
        </Space.Compact>
      </footer>
    </div>
  );
}
