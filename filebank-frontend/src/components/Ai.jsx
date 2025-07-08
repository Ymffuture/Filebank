import React, { useState } from 'react';
import { Button, Input, Typography, Modal, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

const { Text } = Typography;

const ChatBotModal = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me anything.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: input });
      setMessages([...newMessages, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { from: 'bot', text: '⚠️ Error contacting AI.' },
      ]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const renderMessage = (msg) => {
    // handle code blocks
    const parts = msg.text.split(/```([\s\S]*?)```/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <SyntaxHighlighter
            key={idx}
            language="javascript"
            style={atomOneLight}
            customStyle={{ borderRadius: 8, fontSize: 13, margin: '8px 0' }}
          >
            {part.trim()}
          </SyntaxHighlighter>
        );
      }
      // replace bold **text**, inline `code`, and <br/>
      const segments = part.split(/(<br\s*\/?>)/g);
      return segments.map((seg, i) => {
        if (/^<br\s*\/?>>$/.test(seg) || seg === '<br/>' || seg === '<br>') {
          return <br key={i}/>;
        }
        // apply bold and inline code
        const clean = seg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
        return (
          <Text
            key={i}
            style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: 10,
              background: msg.from === 'user' ? '#1E90FF' : '#f5f5f5',
              color: msg.from === 'user' ? '#fff' : '#000',
              maxWidth: '85%',
              wordBreak: 'break-word',
            }}
            // render HTML tags for bold and code
            dangerouslySetInnerHTML={{ __html: clean }}
          />
        );
      });
    });
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)', backgroundColor: '#1E90FF'
        }}
      />

      <Modal
        title="Filebank Chat Assistant"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 0 }}
      >
        <div style={{ marginBottom: 12 }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{ textAlign: msg.from === 'user' ? 'right' : 'left', marginBottom: 12 }}
            >
              {renderMessage(msg)}
            </div>
          ))}
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button type="primary" loading={loading} onClick={sendMessage} disabled={!input.trim()}>
            Send
          </Button>
        </Space.Compact>
      </Modal>
    </>
  );
};

export default ChatBotModal;

