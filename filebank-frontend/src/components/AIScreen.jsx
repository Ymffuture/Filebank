import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Switch, Space, Tooltip } from 'antd';
import { Sun, Moon, Copy, Send } from 'lucide-react';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am FileBank AI. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const scrollRef = useRef();

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    setInput('');
    try {
      const res = await api.post('/chat', { message: input });
      const botMsg = { from: 'bot', text: res.data.reply };
      setMessages(msgs => [...msgs, userMsg, botMsg]);
    } catch (err) {
      setMessages(msgs => [...msgs, userMsg, { from: 'bot', text: 'Error contacting AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <div key={i} className="relative group">
            <SyntaxHighlighter
              language="javascript"
              style={theme === 'light' ? atomOneLight : atomOneDark}
              customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
            >
              {part.trim()}
            </SyntaxHighlighter>
            <Tooltip title="Copy code">
              <Button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                shape="circle"
                size="small"
                icon={<Copy size={16} />}
                onClick={() => navigator.clipboard.writeText(part.trim())}
              />
            </Tooltip>
          </div>
        );
      } else {
        const html = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/(?:<br\s*\/?>|\n)/g, '<br/>');
        return (
          <div
            key={i}
            className={`inline-block p-3 rounded-lg mb-2 whitespace-pre-wrap max-w-[85%] ${msg.from === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-100 text-black self-start'}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-xl font-semibold">FileBank AI</h1>
        <Space>
          <Sun className={theme === 'light' ? 'text-yellow-500' : 'text-gray-400'} />
          <Switch
            checked={theme === 'dark'}
            onChange={checked => setTheme(checked ? 'dark' : 'light')}
          />
          <Moon className={theme === 'dark' ? 'text-blue-200' : 'text-gray-400'} />
        </Space>
      </header>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            {renderMessage(msg, idx)}
          </div>
        ))}
        {loading && <div className="self-start animate-pulse text-gray-500">Typing...</div>}
      </main>

      {/* Input */}
      <div className="p-4 bg-gray-50 flex space-x-2">
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          className="flex-1 rounded-lg"
          placeholder="Ask FileBank AI..."
        />
        <Button
          type="primary"
          className="flex items-center justify-center"
          icon={<Send size={20} />}
          onClick={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
}
