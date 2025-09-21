import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import Lottie from 'lottie-react';
import LoadingAnimation from '../assets/LoadingCloud.json'; // Use a cloud or tech animation!
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

export default function GoogleLoading() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // ✅ Retrieve user from localStorage (set after login)
    const storedUser = localStorage.getItem("filebankUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser?.email || "");
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    // Simulate loading then redirect
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

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

      <Title level={2} style={{ color: '#666' }}>
        Logging in...
      </Title>

      <Text code style={{ color: '#666' }}>
        Please wait while we prepare your Home page.
      </Text>

      {userEmail && (
        <Text strong style={{ marginTop: 16, color: '#000' }}>
          Signed in as: <span className="text-gray-300">{userEmail}</span>
        </Text>
      )}
    </motion.div>
  );
}


