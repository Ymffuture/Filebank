import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Switch, Tooltip, Typography, message, Modal } from 'antd';
import { Input as AntInput } from 'antd';
import { CopyOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import js from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import html from "react-syntax-highlighter/dist/esm/languages/prism/markup";

import copy from 'copy-to-clipboard';
import { SendHorizonal, Mic, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import QuickSuggestionsHero from './QuickSuggestionsHero';
import Lottie from 'lottie-react';
import Wait from '../assets/wait.json'; 
import {Helmet} from 'react-helmet' ;
import { v4 as uuidv4 } from 'uuid';
const { Text } = Typography;

import { DashboardOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';

export default function AIScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello I’m famaAI , your assistant. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [botTypingText, setBotTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
const [value, setValue] = useState(0.1);

const [showImageModal, setShowImageModal] = useState(false);
const [imagePrompt, setImagePrompt] = useState('');
const [generatedImage, setGeneratedImage] = useState(null);
const [imageLoading, setImageLoading] = useState(false);

  const recognitionRef = useRef(null);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);


  // start coding 
const getSessionId = () => {
  let id = localStorage.getItem('famaai-session-id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('famaai-session-id', id);
  }
  return id;
};

const sessionId = getSessionId();

// image code
const generateImage = async () => {
  if (!imagePrompt.trim()) return;
  
  setImageLoading(true);
  
  try {
    const res = await api.post('/generate-image', { prompt: imagePrompt });
    setGeneratedImage(res.data.image);
    setShowImageModal(false);

    // Optionally add image to messages flow
    setMessages(prev => [
      ...prev,
      { from: 'user', text: imagePrompt },
      { from: 'bot', text: res.data.image, type: 'image' }
    ]);

  } catch (err) {
    message.error("Image generation failed.");
    console.error(err);
  } finally {
    setImageLoading(false);
    setImagePrompt('');
  }
};

  
  // Auto-resize effect
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== '') {
        sendMessage(input);
        setInput('');
      }
    }
  };
// start 
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
  window.speechSynthesis.cancel(); // Prevent overlapping speech
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
  setMessages([{ from: 'bot', text: 'Hello I’m famaAI, your assistant. Ask me anything!' }]);
  localStorage.removeItem("chatHistory");
  localStorage.removeItem("famaai-session-id");
};


const sendMessage = async (overrideInput) => {
  const userInput = overrideInput || input;
  if (!userInput.trim()) return;

  const userMsg = { from: 'user', text: userInput };
  setMessages(prev => [...prev, userMsg]);
  setLoading(true);

  try {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop(); // Use stop() for graceful ending
      } catch (err) {
        console.error("Speech recognition stop error:", err);
      }
    }

    const res = await api.post('/chat', {
  message: userInput,
  sessionId, // <-- include this
});

    const fullReply = res.data.reply;

    setIsTyping(true);
  
  let current = "";
  let i = 0;

  const typeInterval = setInterval(() => {
    current += fullReply[i];
    setBotTypingText(current);
    i++;

    if (i === 1) {
      speak(fullReply); // Start TTS only once
    }

    if (i >= fullReply.length) {
      clearInterval(typeInterval);
      setMessages(prev => [...prev, { from: 'bot', text: fullReply }]);
      setBotTypingText('');
      setIsTyping(false);
    }
  }, 1); // ✅ minimum possible, browser will clamp to ~4ms


    // Cleanup interval on unmount
    const cleanup = () => clearInterval(typeInterval);
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);

  } catch (err) {
    console.error(err);
  const createMessage = (from, text, type = 'text', retryAction = null) => ({
  id: `${Date.now()}-${Math.random()}`,
  from,
  text,
  type,
  retryAction,
  timestamp: new Date().toISOString()
});

setMessages(prev => [
  ...prev,
  createMessage(
    'bot',
    '⚠️ Sorry, famacloud AI is currently unreachable.',
    'error',
    () => sendMessage(userInput) 
  )
]);

 setIsTyping(false);
  } finally {
    setLoading(false);
    setInput('');
  }
};

      
// end
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
if (msg.type === 'error') {
      return (
    <div key={idx} className="my-2 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900 dark:text-white flex flex-col gap-2">
      <span>{msg.text}</span>
      {msg.retryAction && (
        <Button
          type="link"
          size="small"
          onClick={msg.retryAction}
          className="w-fit bg-red-500 hover:bg-red-600"
        >
          Retry
        </Button>
      )}
    </div>
  );
}  

{msg.type === 'image' && <img src={msg.text} alt="Generated Image" />}
    
    const parts = msg.text.split(/```(\w+)?\n([\s\S]*?)```/g);

 return parts.map((part, i) => {
  const lang = part || "javascript"; 
  const code = parts[i + 1] || "";
      if (i % 3 === 1) {
        return (
          <div key={`${idx}-code-${i}`} className="relative my-4 group animate-fade-in border rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language={lang} 
              showLineNumbers={true}
              style={atomDark}
              wrapLongLines
               customStyle={{ borderRadius: "8px", fontSize: "14px" }}     
              lineNumberStyle={{
                color: darkMode ? '#999' : '#aaa',
                fontSize: 12,
                paddingRight: 16,
              }}
            >
              {code.trim()}
              
            </SyntaxHighlighter>

            <div className="absolute top-2 right-2 z-10">
              <Tooltip title="Copy code">
                <Button
                  type="text"
                  style={{color:'white', fontSize:'16px' }} 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    copy(part.trim());
                    message.success('Code copied to clipboard');
                  }}
                  className="transition duration-200"
                  aria-label="Copy code"
                />
              </Tooltip>
            </div>
          </div>
        );
      } else {
        
        const html = highlightKeywords(part
  // Strikethrough ~~text~~
  .replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through;">$1</span>')

  // Bold **text**
  .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;">$1</strong>')

  // Italic _text_
  .replace(/(^|[^*])_([^_]+)_/g, '$1<em style="font-style: italic;">$2</em>')

  // Inline code `code`
  .replace(/`([^`]+)`/g, '<code style="background:#f6f8fa;border-radius:4px;padding:2px 6px;font-size:13px;color:#c7254e;">$1</code>')

  // Headings
  .replace(/####\s*(.*?)(<br\/>|$)/g, '<strong style="font-size:16px; font-weight:700; display:block; margin:6px 0;">$1</strong>$2')
  .replace(/###\s*(.*?)(<br\/>|$)/g, '<strong style="font-size:18px; font-weight:700; display:block; margin:6px 0;">$1</strong>$2')
  .replace(/##\s*(.*?)(<br\/>|$)/g, '<strong style="font-size:20px; font-weight:700; display:block; margin:6px 0;">$1</strong>$2')
  .replace(/#\s*(.*?)(<br\/>|$)/g, '<strong style="font-size:22px; font-weight:700; display:block; margin:6px 0;">$1</strong>$2')

  // Bullets * → →
  .replace(/^\s*\*\s+/gm, '→ ')

  // Horizontal rule ---
  .replace(/-{3,}/g, '<hr style="border: none; border-top: 3px solid #ddd; margin: 4px 0;" />')

  // Links
  .replace(/((https?:\/\/|www\.)[^\s<]+)/g, (match) => {
    const url = match.startsWith('http') ? match : `https://${match}`;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sky-500 underline break-all inline-flex items-center">${match}</a>`;
  })

  // Newlines → <br/>
  .replace(/\n/g, '<br/>')
);



        return (
          <div
            key={`${idx}-text-${i}`}
            className={`my-2 p-3 rounded-lg max-w-[100%] whitespace-pre-wrap break-words text-[15px] leading-relaxed animate-fade-in ${
              msg.from === 'user'
                ? 'bg-gray-100 text-[#333] self-end ml-auto max-w-[80%]'
                : 'bg-[transparent] text-[#333] dark:bg-gray-700 dark:text-white'
            }`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
          />
        );
      }
    });
  };

  return (
    <>
    <Helmet>
        <title>FamaAI | Famacloud</title>
        <meta name="description" content="Securely upload your files to Famacloud. Powered by FamaAI " />
      </Helmet>
    
    
    <div className={`${!darkMode ? 'bg-[#333]' : 'bg-white'} h-screen flex flex-col bg-gradient-to-br from-white to-white dark:from-gray-800 dark:to-gray-900`}>
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#121212] shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Left Section: Logo/Version */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-xl shadow">
          FamaAI v3.31.409
        </div>
        <Tooltip title="Go to Dashboard">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-700 dark:text-white hover:text-fuchsia-600 transition"
          >
            <DashboardOutlined className="mr-1" />
            
          </Link>
        </Tooltip>
      </div>

      {/* Right Section: Buttons & Theme Toggle */}
      <div className="flex items-center gap-4">
        <Tooltip title="Clear Chat">
          <Button
            onClick={clearChat}
            icon={<DeleteOutlined />}
            size="small"
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          />
        </Tooltip>

        <Tooltip title="Generate Image currently not available on this app">
          <Button
            onClick={() => setShowImageModal(true)}
            icon={<PictureOutlined />}
            size="small"
            className="bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-all"
          >
            Image
          </Button>
        </Tooltip>

        <Switch
          checked={darkMode}
          onChange={setDarkMode}
          checkedChildren={<BulbOutlined />}
          unCheckedChildren={<BulbOutlined />}
          className="bg-gray-300 dark:bg-gray-600"
        />
      </div>
    </header>
      
      {loading || isTyping ? null : 
        
    <AnimatePresence>
  <QuickSuggestionsHero sendMessage={sendMessage} />
</AnimatePresence>
 }      

      <main ref={containerRef} className="flex-1 overflow-auto p-4 flex flex-col space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMessage(msg, idx)}
          </motion.div>
        ))}

        {loading && !isTyping && (
          <div className="">
              <Lottie
                animationData={Wait}
                loop
                style={{ width: 150, height: 150 }}
              />
            </div>
        )}

        {isTyping && (
          <div className="flex flex-col" aria-live="polite">
            {renderMessage({ from: 'bot', text: botTypingText }, 'typing')}
            <div className="ai-typing-bubble dark:bg-gray-700 dark:text-white">
              <span className='animate-pulse text-[gray]'>typing</span>
              <div className="flex ml-2 gap-1">
                <span className="ai-dot"></span>
                <span className="ai-dot"></span>
                <span className="ai-dot"></span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full px-4 pb-6 pt-2 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="relative border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl flex items-end focus-within:ring-2 focus-within:ring-sky-500 transition">
            <textarea
      ref={textareaRef}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Ask famaAI..."
      aria-label="Type your message to famaAI"
      rows={1}
      className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-0"
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
                aria-label="Voice input"
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
                <ArrowUp size={18} className="text-white" />
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            <b>famaAI</b> may produce errors. Verify answers before using.
          </p>
        </div>
      </footer>
    </div>
<Modal
  title="Generate AI Image"
  open={showImageModal}
  onCancel={() => setShowImageModal(false)}
  onOk={generateImage}
  okText={imageLoading ? 'Generating...' : 'Generate'}
  confirmLoading={imageLoading}
>
  <AntInput.TextArea
    value={imagePrompt}
    onChange={(e) => setImagePrompt(e.target.value)}
    placeholder="Describe the image you want to generate (e.g. futuristic city, cartoon cat)"
    rows={4}
  />
</Modal>

    </>
  );
}

