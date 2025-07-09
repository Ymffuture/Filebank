import React, { useState } from 'react';
import { Button, Input, Typography, Modal, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { ArrowUp} from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('javascript', js);

const { Text } = Typography;

const ChatBotModal = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How filebank AI help? .' },
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
    const parts = msg.text.split(/```([\s\S]*?)```/g); // separate code and text

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // CODE block
        return (
          <SyntaxHighlighter
            key={index}
            language="javascript"
            style={atomOneLight}
            customStyle={{
              borderRadius: 8,
              fontSize: 13,
              margin: '8px 0',
              background: '#f6f8fa',
            }}
          >
            {part.trim()}
          </SyntaxHighlighter>
        );
      } else {
        // TEXT block: parse bold, inline code, and line breaks
        const html = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
          .replace(/`(.*?)`/g, '<code>$1</code>') // inline code
          .replace(/(?:<br\s*\/?>|\n)/g, '<br/>'); // line breaks

        return (
          <Text
            key={index}
            style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: 10,
              background: msg.from === 'user' ? '#333' : '#f5f5f5',
              color: msg.from === 'user' ? '#fff' : '#000',
              maxWidth: '90%',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </Text>
        );
      }
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
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          backgroundColor: '#1E90FF',
        }}
      />

      <Modal
        title="Filebank Chat Assistant"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={'Filebank' }
        width={500}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', paddingBottom: 0 }}
      >
        <div style={{ marginBottom: 12 }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                textAlign: msg.from === 'user' ? 'right' : 'left',
                marginBottom: 12,
              }}
            >
              {renderMessage(msg)}
            </div>
          ))}
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Ask filebank AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{border:'none', padding:'5px' }} 
          />
          <Button type="dashed" loading={loading} onClick={sendMessage} shape='circle'>
            <ArrowUp/>
          </Button>
        </Space.Compact>
      </Modal>
    </>
  );
};

export default ChatBotModal;

