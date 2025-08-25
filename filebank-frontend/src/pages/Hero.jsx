import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space, Row, Col, Modal, Form, Input, Spin } from 'antd';
import { BellOutlined, DashboardFilled, DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import LockAnimation from '../assets/Lock.json';
import UploadAnimation from '../assets/Upload.json';
import TimeAnimation from '../assets/Clock.json';
import HeroAnimation from '../assets/bg.json';
import Lockup from '../assets/Auth.json';
import LockupIn from '../assets/Reg.json';
import {Helmet} from 'react-helmet' 
import RotatingText from './RotatingText' 
import Beams from './Beams';
import DecryptedText from './DecryptedText';
import { AiOutlineDown } from 'react-icons/ai';
import { FaLock, FaUserCircle } from 'react-icons/fa'; // 'fa' = font-awesome
import { Bell } from "lucide-react";


const { Title, Paragraph, Text } = Typography;

export default function Hero() {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    const email = localStorage.getItem('lastLoginEmail');
    if (email) {
      api.post('/auth/check-lock', { email })
        .then(res => {
          const { lockedUntil } = res.data;
          if (lockedUntil && Date.now() < lockedUntil) {
            setIsLockedOut(true);
            setRemainingTime(lockedUntil - Date.now());
          } else {
            setIsLockedOut(false);
            setRemainingTime(0);
          }
        })
        .catch(() => {});
    }
  }, 1000); // run every 1 second

  return () => clearInterval(interval); // cleanup on unmount
}, []);


  
  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.count || 0);
    } catch {}
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      setLoading(true);
      const res = await api.post('/auth/google-login', { credential });

      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);

      enqueueSnackbar('Google login successful!', { variant: 'success' });
      fetchNotifications();
      navigate('/google-loading');
    } catch {
      enqueueSnackbar('Google login failed.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('filebankUser');
    localStorage.removeItem('filebankToken');
    setUser(null);
    enqueueSnackbar('Logged out', { variant: 'info' });
    navigate('/signing-out');
  };

  const userMenu = (
    <Menu
      items={[
        { key: 'RGJ65R', label: <Link to="/profile"><UserOutlined/> Profile</Link> },
        { key: 'TRS75Y', label: <span onClick={handleLogout} className="text-[red]"><LogoutOutlined /> Logout</span> },
      ]}
    />
  );

  const onFinish = async (values) => {
  setLoading(true);
  const email = values.email;
  localStorage.setItem('lastLoginEmail', email);

  try {
    if (isRegistering) {
      await api.post('/auth/register', values);
      enqueueSnackbar('Registration successful! Please verify your email.', { variant: 'success' });
      setIsRegistering(false);
    } else {
      const res = await api.post('/auth/login', values);
      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/');
    }
    setIsModalVisible(false);
  } catch (err) {
    await api.post('/auth/track-login-attempt', { email }); // NEW
    const error = err.response?.data;
    if (error?.lockedUntil) {
      setIsLockedOut(true);
      setRemainingTime(error.lockedUntil - Date.now());
      enqueueSnackbar('Too many login attempts. Try again later.', { variant: 'error' });
    } else {
      enqueueSnackbar(error?.message || 'Login failed', { variant: 'error' });
    }
  } finally {
    setLoading(false);
  }
};


  const handleForgotSubmit = async () => {
    if (!forgotEmail) {
      return message.error('Please enter your email.');
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      enqueueSnackbar('Password reset email sent.', { variant: 'success' });
      setForgotModalVisible(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to send reset email.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
const username = user?.name || user?.displayName || "Famacloud";
const usernamebottom = user?.name || user?.displayName || "Guest";

  const getRandomColor = () => {
  const colors = [
    '#A5D8FF', // soft sky blue
    '#B5EAD7', // mint green
    '#FFD6A5', // light peach
    '#FFB5E8', // pastel pink
    '#FFF3B0', // pale yellow
    '#C9A7EB', // soft lavender
    '#FFDAC1', // cream coral
    '#BEE3DB', // aqua mist
    '#FAD2E1', // blush pink
    '#D7E3FC'  // powder blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};


  
  return (
    <>
<Helmet>
        <title>{username} | Home</title>
       <meta name="theme-color" content="#000" />
        <meta name="description" content="Securely upload your files to Famacloud." />
      </Helmet>
      


    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
      //   backgroundImage: `url('/bg9.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <Beams
          beamWidth={3}
          beamHeight={12}
          beamNumber={14}
          lightColor={getRandomColor()}
          speed={1}
          noiseIntensity={1.75}
          scale={0.3}
          rotation={30}
        />
      </div>
      
      {/* Background Lottie */}
      <Lottie
        animationData={HeroAnimation}
        loop
        style={{
          position: 'absolute',
          top: '25px',
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.2,
          pointerEvents: 'none'
        }}
      />

      {/* Navigation */}
      <div 
        style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', // For Safari
    padding: '1rem 2rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.08)', // Transparent white
    border: '1px solid #202124',
    boxShadow: '0 4px 30px #202124',
    position: 'relative',
    zIndex: 1,
    color: '#fff', // white text for dark background
  }}>
        <Title level={3} style={{ margin: 0, color: '#0B3D91' }}>Famacloud</Title>
        {user ? (
          <Space>
  <Badge count={notifications} size="small" offset={[-4, 3]}>
    <Bell
      style={{ fontSize: 24, cursor: "pointer", color: "#fff" }}
      onClick={fetchNotifications}
    />
  </Badge>
  <Dropdown overlay={userMenu}>
    <Space style={{ cursor: "pointer" }}>
      <Avatar  icon={ <FaUserCircle className="text-gray-400 text-2xl" />} />
      <Text style={{ color: "#fff" }}>
        {user.name || user.displayName
          ? (user.name || user.displayName).length > 6
            ? (user.name || user.displayName).slice(0, 6) + "..."
            : user.name || user.displayName
          : "Famacloud"}
      </Text>
      
    </Space>
  </Dropdown>
</Space>
        ) : (
          <Space>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => message.error('Google login failed')}
              useOneTap
              theme="filled_blue"
              size="large"
              text="continue_with"
              shape="circle"
              logo_alignment="left"
            />
          </Space>
        )}
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', 
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '4rem 2rem',
          textAlign: 'center',
          borderRadius: '20px',
          maxWidth: '900px',
          margin: '4rem auto',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          zIndex: 1
  
        }}
      >
        <Title style={{ color: '#fff' , fontSize: '3rem', marginBottom: '1rem' }}>
            <DecryptedText
               text="Store with Renown, Access Anywhere" 
               animateOn="view"
                revealDirection="center"
               /> 
        </Title>
      
        <Paragraph style={{ fontSize: '1.2rem', color: '#fff' }}>
          Upload, manage, and access your files anywhere with <strong>Famacloud</strong>.
        </Paragraph>
        {!user? <Button size="large" style={{
          marginTop: '2rem',
          padding: '0 2.5rem',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', 
          background: 'linear-gradient(to bottom, #202124, #121212, #fff )', 
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 500,
          boxShadow: '0 6px 18px #000'
        }} onClick={() => setIsModalVisible(true)}>
          Get Started
        </Button>:
          <Button size="large" style={{
          marginTop: '2rem',
          padding: '0 2.5rem',
            backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', 
          background: 'linear-gradient(to bottom, #202124, #121212,#fff)', 
          borderRadius: '8px',
          color: '#fff' ,
          fontWeight: 400,
          boxShadow: '0 6px 18px #121212'
        }} >
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>} 
      </motion.div>

      {/* Overview Section */}
      <div style={{
      backdropFilter: 'blur(8px)',
       WebkitBackdropFilter: 'blur(8px)', 
        background: 'rgba(255, 255, 255, 0.08)',
        padding: '3rem 2rem',
        borderRadius: '20px',
        maxWidth: '1000px',
        margin: '2rem auto',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        zIndex: 1
      }}>
        <Title level={2} style={{ textAlign: 'center', color: '#0B3D91' }}>Overview</Title>
        <Row gutter={[32, 32]} justify="center" style={{ marginTop: '2rem', color:'#fff' }}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={LockAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong style={{color:'#fff'}} >End-to-End Encryption</Text>
              <Text type="secondary" style={{ textAlign: 'center', color:'#fff' }}>
                All files are encrypted for maximum security.
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={UploadAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong style={{color:'#fff'}} >Unlimited Uploads</Text>
              <Text type="secondary" style={{ textAlign: 'center', color:'#fff' }}>
                Upload images, videos, PDFs, code, and more.
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={TimeAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong style={{color:'#fff'}}>Auto Expiry</Text>
              <Text type="secondary" style={{ textAlign: 'center', color:'#fff' }}>
                Files auto-expire after 90 days unless renewed.
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Login/Register Modal */}
<Modal
  title={
    <span style={{ color: '#0d6efd' }}> 
      {isRegistering ? "Create Your Famacloud Account" : "Welcome back! "}
    </span>
  }
  open={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  footer={isLockedOut ? 'Form Locked 🔒' : 'You have 1 login attempt.'}
  centered
  style={{
    color: '#0d6efd', // text color
    border: '4px solid gray',
    borderRadius: '10px', 
    zIndex:9999,
  }}
  bodyStyle={{
    backgroundColor: '#fff', // light blue background
    color: '#0d6efd',
    fontWeight: 500
  }}
>

  {loading ? (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
  <Spin size="large" style={{ color: 'black' }} />
</div>

  ) : (
    <Form layout="vertical" onFinish={onFinish}>
      {!isRegistering ? (
        <div className="flex justify-center mb-4">
          <Lottie animationData={Lockup} loop style={{ width: 100, height: 100 }} />
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <Lottie animationData={LockupIn} loop style={{ width: 110, height: 110 }} />
        </div>
      )}

      {!isRegistering && isLockedOut && (
        <Text
          type="danger"
          style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}
        >
          Too many failed attempts. Try again in {Math.ceil(remainingTime / 60000)} minute(s).
        </Text>
      )}

      {isRegistering && (
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input placeholder="Your Name" />
        </Form.Item>
      )}
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input placeholder="yourname@example.com" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password placeholder="Minimum 6 characters" />
      </Form.Item>
      <Form.Item>
        <Button
          htmlType="submit"
          block
          size="large"
          disabled={isLockedOut}
          style={{
            background: isLockedOut
              ? '#999'
              : 'linear-gradient(117deg, #6366F1, #8B5CF6,#1E90FF)',
            border: 'none',
            color: '#fff',
            borderRadius: '30px',
            cursor: isLockedOut ? 'not-allowed' : 'pointer',
          }}
        >
          {isRegistering
            ? 'Register'
            : isLockedOut
            ? 'Account Locked'
            : 'Login'}
        </Button>

        
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}>
        <Text
          type="secondary"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Text>
        <br />
        <Text
          type="secondary"
          style={{
            cursor: 'pointer',
            display: isRegistering ? 'none' : 'inline-block',
            marginTop: '1rem',
          }}
          onClick={() => setForgotModalVisible(true)}
        >
          Forgot password?
        </Text>
        <br />
        <Text
          style={{
            cursor: 'pointer',
            display: 'inline-block',
            marginTop: '1rem',
            color: '#1E90FF',
          }}
        >
          <Link to="/terms" style={{ marginRight: 12, color: '#1E90FF' }}>
            Terms
          </Link>
          |
          <Link to="/privacy" style={{ marginLeft: 12, color: '#1E90FF' }}>
            Privacy
          </Link>
        </Text>
      </Form.Item>
    </Form>
  )}
</Modal>


      {/* Forgot Password Modal */}
      <Modal
        title="Reset Password"
        open={forgotModalVisible}
        onOk={handleForgotSubmit}
        onCancel={() => setForgotModalVisible(false)}
        okText="Send Reset Link"
      >
        <Input
          placeholder="Enter your email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
        />
      </Modal>

      {/* Global Footer */}
      <div
        style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '1rem',
        color: '#777',
        fontSize: '0.85rem', 
      backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', // For Safari
    padding: '1rem 2rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.08)', // Transparent white
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}>
  
<RotatingText
  texts={['Hey 👋', usernamebottom , 'Welcome to Famacloud', 'Start uploading', 'Images', 'and', 'Files', 'Try it', 'Why stop? ', 'Do not stop 🛑', 'Now.' ]}
  mainClassName="p-6 font-bold text-[16px] sm:p-4 md:p-3 bg-[#1E90FF] rounded-lg text-white overflow-hidden py-0.5 sm:py-2 md:py-2 justify-center rounded"
  staggerFrom={"last"}
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
  style={{ 
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', // For Safari
    padding: '1rem 2.5rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.08)', // Transparent white
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  }} 
/> 
      </div>


    </motion.div>
    </>
  );
}
