import React, { useState } from 'react';
import { Button, Input, Typography, Modal, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

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

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          backgroundColor: '#1E90FF',
        }}
      />

      <Modal
        title="🤖 Chat Assistant"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 0 }}
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
                  background:
                    msg.from === 'user' ? '#1E90FF' : '#f5f5f5',
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
          <Button
            type="primary"
            loading={loading}
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </Space.Compact>
      </Modal>
    </>
  );
};

export default ChatBotModal;

