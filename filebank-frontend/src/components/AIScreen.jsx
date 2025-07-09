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
    { from: 'bot', text: 'Welcome to **FileBank AI Assistant**!\n\nAsk me anything about FileBank.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message: input });
      setMessages(m => [...m, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: '⚠️ Error contacting AI.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessage = (msg, idx) => {
    // Split into code and text segments
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        // Code block
        return (
          <div key={i} className="relative group my-2">
            <SyntaxHighlighter
              language="javascript"
              style={darkMode ? atomOneDark : atomOneLight}
              customStyle={{ borderRadius: 6, padding: '12px', fontSize: 14 }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copy(part.trim())}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Tooltip>
          </div>
        );
      } else {
        // Text block: handle **bold** and line breaks
        const html = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // bold
          .replace(/\n/g, '<br/>');                          // new lines
        const alignment = msg.from === 'user' ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-200 dark:bg-gray-700 dark:text-white';
        return (
          <div
            key={i}
            className={`my-2 p-3 max-w-[80%] rounded-lg ${alignment}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    });
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">FileBank AI</h1>
        <Space>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Space>
      </header>

      {/* Chat Window */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            {msg.from === 'bot' && (
              <Typing
                text={[msg.text]}
                speed={25}
                eraseDelay={Infinity}
                cursor="_"
                displayTextRenderer={(text) => (
                  <div className="my-2 p-3 max-w-[80%] rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white">
                    {/* The typing effect */}
                    {text.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>
                )}
              />
            )}
            {renderMessage(msg, idx)}
          </div>
        ))}
      </main>

      {/* Input */}
      <footer className="p-4 bg-gray-100 dark:bg-gray-800">
        <Space.Compact className="w-full">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button type="primary" loading={loading} onClick={sendMessage}>Send</Button>
        </Space.Compact>
      </footer>
    </div>
  );
}

