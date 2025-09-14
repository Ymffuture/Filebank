import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import Lottie from 'lottie-react';
import LoadingAnimation from '../assets/LoadingCloud.json'; // Use a cloud or tech animation!
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

export default function GoogleLoading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // Simulates loading, you can make it dynamic

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fff] to-[whitesmoke] text-white p-6"
    >
      <div className="w-52 h-52 mb-8">
        <Lottie animationData={LoadingAnimation} loop />
      </div>

      <Title level={2} style={{ color: '#666' }}>Logging out...</Title>
      <Text code style={{ color: '#777' }}>
        Please wait while we saving your data before logging out...
      </Text>
    </motion.div>
  );
}
