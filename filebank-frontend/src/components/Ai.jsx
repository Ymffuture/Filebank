import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';
import api from '../api/apiFile.js';
const ChatBot = () => {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! Ask me anything.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: input });
      setMessages([...newMessages, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages([...newMessages, { from: 'bot', text: 'Error contacting AI.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" w="350px" p="4" bg="white" borderRadius="lg" boxShadow="lg" zIndex={1000}>
      <VStack align="stretch" spacing={2}>
        <Box maxH="300px" overflowY="auto">
          {messages.map((msg, idx) => (
            <Text key={idx} align={msg.from === 'bot' ? 'left' : 'right'} bg={msg.from === 'bot' ? '#f0f0f0' : '#1E90FF'} color={msg.from === 'bot' ? 'black' : 'white'} p="2" borderRadius="md">
              {msg.text}
            </Text>
          ))}
        </Box>
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button colorScheme="blue" onClick={sendMessage} isLoading={loading}>Send</Button>
      </VStack>
    </Box>
  );
};

export default ChatBot;

