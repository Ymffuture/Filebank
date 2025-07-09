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
    { from: 'bot', text: 'Welcome to FileBank AI!\nAsk me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 150) {
        containerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.replace(/[\*`]/g, '') };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: input });
      setMessages(prev => [...prev, { from: 'bot', text: data.reply.replace(/[\*`]/g, '') }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: '⚠️ Error contacting AI. Please try again.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessage = (msg) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    const align = msg.from === 'user' ? 'items-end' : 'items-start';

    return (
      <div className={`flex flex-col ${align} w-full`} key={Math.random()}>
        {parts.map((part, i) => (
          i % 2 === 1 ? (
            <div key={i} className="relative w-full max-w-xl bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 my-2 shadow-lg group">
              <SyntaxHighlighter
                language="javascript"
                style={darkMode ? atomOneDark : atomOneLight}
                customStyle={{ borderRadius: '1rem' }}
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
          ) : (
            <div key={i} className="flex space-x-3 my-2 max-w-xl w-full">
              {msg.from === 'bot' && <RobotOutlined className="text-2xl text-[#1E90FF]" />}
              <div
                className={`relative p-4 rounded-2xl break-words shadow-sm w-full
                  ${msg.from === 'user'
                    ? 'bg-[#32CD32] text-white self-end'
                    : 'bg-[#FFD700] dark:bg-yellow-600 text-gray-900'}
                `}
              >
                {part.split(/\n/).map((line, idx) => (
                  <p key={idx} className="mb-1">{line}</p>
                ))}
              </div>
              {msg.from === 'user' && <UserOutlined className="text-2xl text-[#1E90FF]" />}
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} flex flex-col h-screen bg-white dark:bg-gray-900`}>      
      <header className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1E90FF] to-[#32CD32] shadow-md">
        <h1 className="text-2xl font-bold text-white">FileBank AI</h1>
        <Switch
          checked={darkMode}
          onChange={setDarkMode}
          checkedChildren={<BulbOutlined className="text-yellow-300" />}
          unCheckedChildren={<BulbOutlined className="text-gray-200" />}
        />
      </header>

      <main
        ref={containerRef}
        className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#1E90FF] scrollbar-track-gray-200 dark:scrollbar-thumb-gray-700"
        aria-live="polite"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="animate-fade-in">{renderMessage(msg)}</div>
        ))}
        {loading && (
          <div className="flex items-start space-x-3">
            <RobotOutlined className="text-2xl text-[#1E90FF] animate-pulse" />
            <p className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl">AI is thinking...</p>
          </div>
        )}
      </main>

      <footer className="p-4 bg-gray-100 dark:bg-gray-800">
        <div className="flex gap-2 md:gap-4">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 rounded-full border border-gray-300 focus:border-[#1E90FF]"
            disabled={loading}
            aria-label="Type your question"
          />
          <Button
            type="primary"
            loading={loading}
            onClick={sendMessage}
            className="rounded-full px-6 py-2 bg-gradient-to-r from-[#1E90FF] to-[#32CD32] hover:opacity-90"
            aria-label="Send message"
          >
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}

