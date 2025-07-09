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
    { from: 'bot', text: 'Welcome to **FileBank AI**!\n\nAsk me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: input });
      setMessages(m => [...m, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: '⚠️ Error contacting AI.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderText = (text, from) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    const alignment = from === 'user'
      ? 'self-end bg-blue-600 text-white ml-auto'
      : 'self-start bg-gray-200 dark:bg-gray-700 dark:text-white';
    return (
      <div
        className={`p-3 max-w-[70%] rounded-lg ${alignment}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
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
              />
            </Tooltip>
          </div>
        );
      } else {
        return (
          <div key={i} className="my-2">
            {msg.from === 'bot' && i === 0 && loading ? (
              <Typing
                text={[part]}
                speed={30}
                eraseDelay={10000000}
                typingDelay={150}
                cursor="_"
                displayTextRenderer={text => renderText(text, 'bot')}
              />
            ) : (
              renderText(part, msg.from)
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-white dark:bg-gray-900`}>      
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">FileBank AI</h1>
        <Space>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Space>
      </header>

      <main ref={containerRef} className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            {renderMessage(msg, idx)}
          </div>
        ))}
      </main>

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
``

