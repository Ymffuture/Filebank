import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Switch, Tooltip, Typography, message} from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';
import { SendHorizonal, Mic, ArrowUp} from 'lucide-react';
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
    // JavaScript & Python common methods
    .replace(/\bmap\(\)/g, '<code style="color:#1677ff;background:#f0f5ff;padding:2px 4px;border-radius:4px;">map()</code>')
    .replace(/\bfilter\(\)/g, '<code style="color:#52c41a;background:#f6ffed;padding:2px 4px;border-radius:4px;">filter()</code>')
    .replace(/\breduce\(\)/g, '<code style="color:#fa8c16;background:#fff7e6;padding:2px 4px;border-radius:4px;">reduce()</code>')
    .replace(/\bsort\(\)/g, '<code style="color:#13c2c2;background:#e6fffb;padding:2px 4px;border-radius:4px;">sort()</code>')
    .replace(/\bforEach\(\)/g, '<code style="color:#722ed1;background:#f9f0ff;padding:2px 4px;border-radius:4px;">forEach()</code>')

    // Python keywords
    .replace(/\blambda\b/g, '<code style="color:#eb2f96;background:#fff0f6;padding:2px 4px;border-radius:4px;">lambda</code>')
    .replace(/\bdef\b/g, '<code style="color:#fa541c;background:#fff2e8;padding:2px 4px;border-radius:4px;">def</code>')
    .replace(/\bimport\b/g, '<code style="color:#5cdbd3;background:#e6fffb;padding:2px 4px;border-radius:4px;">import</code>')
    .replace(/\bprint\(/g, '<code style="color:#2f54eb;background:#f0f5ff;padding:2px 4px;border-radius:4px;">print(</code>')

    // Java keywords
    .replace(/\bpublic\b/g, '<code style="color:#d46b08;background:#fff7e6;padding:2px 4px;border-radius:4px;">public</code>')
    .replace(/\bstatic\b/g, '<code style="color:#9254de;background:#f9f0ff;padding:2px 4px;border-radius:4px;">static</code>')
    .replace(/\bvoid\b/g, '<code style="color:#08979c;background:#e6fffb;padding:2px 4px;border-radius:4px;">void</code>')
    .replace(/\bSystem\.out\.println\(/g, '<code style="color:#0050b3;background:#e6f7ff;padding:2px 4px;border-radius:4px;">System.out.println(</code>')

    // C/C++ syntax
    .replace(/\b#include\b/g, '<code style="color:#1890ff;background:#f0f5ff;padding:2px 4px;border-radius:4px;">#include</code>')
    .replace(/\bstd::cout\b/g, '<code style="color:#f5222d;background:#fff1f0;padding:2px 4px;border-radius:4px;">std::cout</code>')
    .replace(/\bstd::endl\b/g, '<code style="color:#722ed1;background:#f9f0ff;padding:2px 4px;border-radius:4px;">std::endl</code>')
    .replace(/\bint\b/g, '<code style="color:#3f6600;background:#f6ffed;padding:2px 4px;border-radius:4px;">int</code>');
};


  const renderMessage = (msg, idx) => {
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
  <div key={`${idx}-code-${i}`} className="relative my-4 group animate-fade-in border rounded-lg overflow-hidden">
  <SyntaxHighlighter
    language="javascript"
    showLineNumbers={true}
    style={darkMode ? atomOneDark : atomOneLight}
    customStyle={{
      borderRadius: 0,
      margin: 0,
      padding: '16px',
      fontSize: 14,
      background: 'transparent',
    }}
  >
    {part.trim()}
  </SyntaxHighlighter>

  <div className="absolute top-2 right-2 z-10">
    <Tooltip title="Copy code">
      <Button
        type="default"
        size="small"
        icon={<CopyOutlined />}
        onClick={() => {
          copy(part.trim());
          message.success('Code copied to clipboard');
        }}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:border-sky-500 hover:text-sky-600 transition duration-200"
        aria-label="Copy code"
      />
    </Tooltip>
    </div>
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
            className={`my-2 p-3 rounded-lg max-w-[80%] whitespace-pre-wrap break-words text-[15px] leading-relaxed animate-fade-in ${
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
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-gradient-to-br from-white to-white dark:from-gray-800 dark:to-gray-900`}>
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold text-[#333] dark:text-white">Filebank cloud AI</h1>
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
  <div className="flex flex-col gap-1">
    {renderMessage({ from: 'bot', text: botTypingText }, 'typing')}

    <div className="ai-typing-bubble dark:bg-gray-700 dark:text-white">
      <span>Typing</span>
      <div className="flex ml-2 gap-1">
        <span className="ai-dot"></span>
        <span className="ai-dot"></span>
        <span className="ai-dot"></span>
      </div>
    </div>
  </div>
)}
      </main>
<footer className="w-full px-4 pb-6 pt-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
  <div className="max-w-3xl mx-auto flex flex-col gap-2">
    <div className="relative border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-end focus-within:ring-2 focus-within:ring-sky-500 transition">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        rows={1}
        placeholder="Send a message"
        className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none"
        aria-label="Type your message"
      />
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Mic icon (optional) */}
        <button
          type="button"
          className="text-gray-400 hover:text-sky-500 transition"
          aria-label="Voice input"
        >
          <Mic size={20} />
        </button>

        {/* Send icon */}
        <button
          type="button"
          onClick={sendMessage}
          className="bg-[#333] hover:bg-[gray] text-white p-2 rounded-full transition flex items-center justify-center"
          aria-label="Send message"
        >
          <ArrowUp size={18} className="transform rotate-45" />
        </button>
      </div>
    </div>

    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
      Filebank AI may produce errors. Verify answers before using.
    </p>
  </div>
</footer>

    </div>
  );
}

