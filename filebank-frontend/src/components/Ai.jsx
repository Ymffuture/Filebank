import React, { useState } from 'react';
import { Button, Input, Typography, Card, Space } from 'antd';
import api from '../api/fileApi';

const { Text } = Typography;

const ChatBot = () => {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! Ask me anything.' }]);
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
      setMessages([...newMessages, { from: 'bot', text: '⚠️ Error contacting AI.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }}
      bodyStyle={{ padding: '16px', maxHeight: 450, overflowY: 'auto' }}
      title="🤖 Chat Assistant"
    >
      <div style={{ marginBottom: 12 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.from === 'user' ? 'right' : 'left',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 10,
                background: msg.from === 'user' ? '#1E90FF' : '#f5f5f5',
                color: msg.from === 'user' ? '#fff' : '#000',
                maxWidth: '85%',
                wordBreak: 'break-word',
              }}
            >
              {msg.text}
            </Text>
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
        <Button type="primary" loading={loading} onClick={sendMessage}>
          Send
        </Button>
      </Space.Compact>
    </Card>
  );
};

export default ChatBot;

