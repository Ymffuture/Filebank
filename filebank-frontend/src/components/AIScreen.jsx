import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Switch, Tooltip } from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import Typing from 'react-typing-effect';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';

SyntaxHighlighter.registerLanguage('javascript', js);

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome to FileBank AI Assistant!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message: input });
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error contacting AI.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <div key={`${idx}-code-${i}`} className="relative group my-2">
            <SyntaxHighlighter
              language="javascript"
              style={darkMode ? atomOneDark : atomOneLight}
              customStyle={{ borderRadius: 8 }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copy(part.trim())}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
              />
            </Tooltip>
          </div>
        );
      } else {
        const html = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>');
        return (
          <div
            key={`${idx}-text-${i}`}
            className={`my-2 p-2 rounded-lg ${msg.from === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 dark:bg-gray-700 dark:text-white self-start'}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    });
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors`}>      
      <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">FileBank AI</h1>
        <Space>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Space>
      </header>

      <main ref={containerRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            {msg.from === 'bot' ? (
              <Typing
                speed={50}
                text={[msg.text]}
                cursorRenderer={cursor => <span>{cursor}</span>}
                displayTextRenderer={(text, i) => (
                  <>{/* render entire message at once */}</>
                )}
              />
            ) : null}
            {renderMessage(msg, idx)}
          </div>
        ))}
      </main>

      <footer className="p-4 bg-gray-100 dark:bg-gray-800">
        <Space.Compact className="w-full">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1"
          />
          <Button type="primary" loading={loading} onClick={sendMessage}>Send</Button>
        </Space.Compact>
      </footer>
    </div>
  );
}

