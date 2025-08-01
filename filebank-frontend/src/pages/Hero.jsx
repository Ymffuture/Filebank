import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space, Row, Col, Modal, Form, Input, Spin } from 'antd';
import { BellOutlined, DashboardFilled, DownOutlined, LogoutOutlined } from '@ant-design/icons';
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
        { key: '1', label: <Link to="/profile">Profile</Link> },
        { key: '2', label: <Link to="/feedback"> Feedback</Link> },
        { key: '3', label: <span onClick={handleLogout} className="text-[red]"><LogoutOutlined /> Logout</span> },
      ]}
    />
  );

  const onFinish = async (values) => {
    setLoading(true);
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
      enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
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

  return (
    <>
<Helmet>
        <title> Home | Famacloud</title>
        <meta name="description" content="Securely upload your files to Famacloud." />
      </Helmet>
      
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        backgroundImage: `url('/bg9.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem',
        position: 'relative'
      }}
    >
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(8px)',
        padding: '1rem 2rem',
        borderRadius: '20px',
        background: '#fff',

        position: 'relative',
        zIndex: 1
      }}>
        <Title level={3} style={{ margin: 0, color: '#0B3D91' }}>Famacloud</Title>
        {user ? (
          <Space>
            <Badge count={notifications} size="small">
              <BellOutlined style={{ fontSize: 24, cursor: 'pointer', color: '#333' }} onClick={fetchNotifications} />
            </Badge>
            <Dropdown overlay={userMenu}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user.picture} />
                <Text>{user.name || user.displayName}</Text>
                <DownOutlined />
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
          background: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
          borderRadius: '20px',
          maxWidth: '900px',
          margin: '4rem auto',
          zIndex: 1
  
        }}
      >
        <Title style={{ color: '#0B3D91', fontSize: '3rem', marginBottom: '1rem' }}>
          Store with Renown, Access Anywhere
        </Title>
        <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
          Upload, manage, and access your files anywhere with <strong>Famacloud</strong>.
        </Paragraph>
        {!user? <Button size="large" style={{
          marginTop: '2rem',
          padding: '0 2.5rem',
          background: 'linear-gradient(90deg, #1E90FF 0%, #32CD32 100%)',
          borderRadius: '30px',
          color: '#fff',
          fontWeight: 500,
          boxShadow: '0 6px 18px rgba(30,144,255,0.4)'
        }} onClick={() => setIsModalVisible(true)}>
          Get Started Free
        </Button>:
          <Button size="large" style={{
          marginTop: '2rem',
          padding: '0 2.5rem',
          background: 'linear-gradient(90deg, #1E90FF 0%, #32CD32 100%)',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 400,
          boxShadow: '0 6px 18px rgba(30,144,255,0.4)'
        }} >
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>} 
      </motion.div>

      {/* Overview Section */}
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '3rem 2rem',
        borderRadius: '20px',
        maxWidth: '1000px',
        margin: '2rem auto',
        zIndex: 1
      }}>
        <Title level={2} style={{ textAlign: 'center', color: '#0B3D91' }}>Overview</Title>
        <Row gutter={[32, 32]} justify="center" style={{ marginTop: '2rem' }}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={LockAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong>End-to-End Encryption</Text>
              <Text type="secondary" style={{ textAlign: 'center' }}>
                All files are encrypted for maximum security.
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={UploadAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong>Unlimited Uploads</Text>
              <Text type="secondary" style={{ textAlign: 'center' }}>
                Upload images, videos, PDFs, code, and more.
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" align="center">
              <Lottie animationData={TimeAnimation} loop style={{ width: 80, height: 80 }} />
              <Text strong>Auto Expiry</Text>
              <Text type="secondary" style={{ textAlign: 'center' }}>
                Files auto-expire after 90 days unless renewed.
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Login/Register Modal */}
      <Modal
        title={isRegistering ? "Create Your Famacloud Account" : "Login to Famacloud"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        style={{color:'#666'}} 
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form layout="vertical" onFinish={onFinish}>
            
            {!isRegistering? <div className="flex justify-center mb-4">
              <Lottie animationData={Lockup} loop style={{ width: 80, height: 80}} />
            </div>: <div className="flex justify-center mb-4">
              <Lottie animationData={LockupIn} loop style={{ width: 110, height: 110}} />
            </div>} 
              
            {isRegistering && (
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Your Name" />
              </Form.Item>
            )}
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="yourname@example.com" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Minimum 6 characters" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" block size="large" style={{
              background: 'linear-gradient(117deg, #6366F1, #8B5CF6,#1E90FF)',
              border: 'none',
              color: '#fff',
              borderRadius: '30px'
            }}>
                {isRegistering ? "Register" : "Login"}
              </Button>
            </Form.Item>
            <Form.Item style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
              </Text>
              <br />
              <Text type="secondary" style={{ cursor: 'pointer', display: isRegistering ? 'none' : 'inline-block', marginTop: '1rem' }} onClick={() => setForgotModalVisible(true)}>
                Forgot password?
              </Text>
              <br/>
              <Text style={{ cursor: 'pointer', display: 'inline-block', marginTop: '1rem', color:'#1E90FF'}} >
              <Link to="/terms" style={{ marginRight: 12, color:'#1E90FF' }}>Terms</Link>
              |
              <Link to="/privacy" style={{ marginLeft: 12, color:'#1E90FF' }}>Privacy</Link>
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
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '1rem',
        color: '#777',
        fontSize: '0.85rem'
      }}>
  
<RotatingText
  texts={['React', 'Bits', 'Is', 'Cool!']}
  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
  staggerFrom={"last"}
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
/> 
      </div>

    </motion.div>
    </>
  );
}

