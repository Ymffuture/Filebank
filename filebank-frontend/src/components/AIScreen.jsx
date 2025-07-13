import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Switch, Tooltip, Typography, message } from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { dracula, github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import copy from 'copy-to-clipboard';
import { Mic, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';

const { Text } = Typography;

SyntaxHighlighter.registerLanguage('javascript', js);

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello I’m FBC-AI, your assistant. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [botTypingText, setBotTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const containerRef = useRef(null);

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = (event) => {
      message.error("Speech error: " + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 100);
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    initSpeechRecognition();
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, botTypingText]);

  const clearChat = () => {
    setMessages([{ from: 'bot', text: 'Hello I’m FBC-AI, your assistant. Ask me anything!' }]);
    localStorage.removeItem("chatHistory");
  };

  const sendMessage = async (overrideInput) => {
    const userInput = overrideInput || input;
    if (!userInput.trim()) return;
    const userMsg = { from: 'user', text: userInput };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.abort();
    }

    try {
      const res = await api.post('/chat', { message: userInput });
      const fullReply = res.data.reply;

      setIsTyping(true);
      let current = '';
      let i = 0;

      const typeInterval = setInterval(() => {
        current += fullReply[i];
        setBotTypingText(current);
        i++;

        if (i === 1) {
          speak(fullReply);
        }

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
      .replace(/\breduce\(\)/g, '<code style="color:#fa8c16;background:#fff7e6;padding:2px 4px;border-radius:4px;">reduce()</code>')
      .replace(/\bsort\(\)/g, '<code style="color:#13c2c2;background:#e6fffb;padding:2px 4px;border-radius:4px;">sort()</code>')
      .replace(/\bforEach\(\)/g, '<code style="color:#722ed1;background:#f9f0ff;padding:2px 4px;border-radius:4px;">forEach()</code>')
      .replace(/\blambda\b/g, '<code style="color:#eb2f96;background:#fff0f6;padding:2px 4px;border-radius:4px;">lambda</code>')
      .replace(/\bdef\b/g, '<code style="color:#fa541c;background:#fff2e8;padding:2px 4px;border-radius:4px;">def</code>')
      .replace(/\bimport\b/g, '<code style="color:#5cdbd3;background:#e6fffb;padding:2px 4px;border-radius:4px;">import</code>')
      .replace(/\bprint\(/g, '<code style="color:#2f54eb;background:#f0f5ff;padding:2px 4px;border-radius:4px;">print(</code>')
      .replace(/\bpublic\b/g, '<code style="color:#d46b08;background:#fff7e6;padding:2px 4px;border-radius:4px;">public</code>')
      .replace(/\bstatic\b/g, '<code style="color:#9254de;background:#f9f0ff;padding:2px 4px;border-radius:4px;">static</code>')
      .replace(/\bvoid\b/g, '<code style="color:#08979c;background:#e6fffb;padding:2px 4px;border-radius:4px;">void</code>')
      .replace(/\bSystem\.out\.println\(/g, '<code style="color:#0050b3;background:#e6f7ff;padding:2px 4px;border-radius:4px;">System.out.println(</code>')
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
              style={darkMode ? github : dracula}
              customStyle={{
                padding: '20px',
                margin: 0,
                background: '#0d1117',
                fontSize: 14,
                fontFamily: `'Fira Code', 'JetBrains Mono', monospace`,
                overflowX: 'auto',
                lineHeight: '1.6',
              }}
              lineNumberStyle={{
                color: darkMode ? '#999' : '#aaa',
                fontSize: 12,
                paddingRight: 16,
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
                />
              </Tooltip>
            </div>
          </div>
        );
      } else {
        const html = highlightKeywords(part)
          .replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through;">$1</span>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(^|[^*])_([^_]+)_/g, '$1<em>$2</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br/>');

        return (
          <div
            key={`${idx}-text-${i}`}
            aria-live="polite"
            className={`my-2 p-3 rounded-lg max-w-[100%] whitespace-pre-wrap break-words text-[15px] leading-relaxed animate-fade-in ${
              msg.from === 'user'
                ? 'bg-gray-100 text-[#333] self-end ml-auto max-w-[80%]'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
          />
        );
      }
    });
  };

  return (
    <div className={`${darkMode ? 'bg-[#333]' : ''} h-screen flex flex-col bg-gradient-to-br from-white to-white dark:from-gray-800 dark:to-gray-900`}>
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <h1 className="text-[14px] font-bold text-[gray] dark:text-white">FBC AI 3.1.0v</h1>
        <Link to='/dashboard'>Dashboard</Link>
        <Button onClick={clearChat} size="small">Clear</Button>
        <Space>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
        </Space>
      </header>

      <main ref={containerRef} className="flex-1 overflow-auto p-4 flex flex-col space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMessage(msg, idx)}
          </motion.div>
        ))}
      </main>

      <footer className="w-full px-4 pb-6 pt-2 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="relative border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl flex items-end focus-within:ring-2 focus-within:ring-sky-500 transition">
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
              placeholder="Ask filebank AI..."
              className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none"
            />
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current.stop();
                  } else {
                    recognitionRef.current.start();
                  }
                }}
                className={`transition p-2 rounded-full ${isRecording ? '' : 'text-gray-400 hover:text-sky-500'}`}
              >
                <Mic size={20} className={isRecording ? 'animate-pulse text-[red]' : ''} />
              </button>

              <button
                type="button"
                disabled={loading || isTyping}
                onClick={() => sendMessage()}
                className={`${
                  loading || isTyping ? 'opacity-50 animate-pulse' : ''
                } bg-[#333] hover:bg-[gray] text-white p-2 rounded-full transition`}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            <b>Filebank AI</b> may produce errors. Verify answers before using.
          </p>
        </div>
      </footer>
    </div>
  );
}

