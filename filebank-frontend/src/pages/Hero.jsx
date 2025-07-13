import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space, Row, Col, Modal, Form, Input } from 'antd';
import { BellOutlined, DashboardFilled, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';

const { Title, Paragraph, Text } = Typography;

export default function Hero() {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.count || 0);
    } catch {}
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await api.post('/auth/google-login', { credential });

      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);

      enqueueSnackbar('Login successful!', { variant: 'success' });
      fetchNotifications();
      navigate('/dashboard');
    } catch {
      enqueueSnackbar('Google login failed.', { variant: 'error' });
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('filebankUser');
    localStorage.removeItem('filebankToken');
    setUser(null);
    enqueueSnackbar('Logged out', { variant: 'info' });
    navigate('/');
  };

  const userMenu = (
    <Menu
      items={[
        { key: '1', label: <span onClick={handleLogout}><LogoutOutlined /> Logout</span> },
        { key: '2', label: <Link to="/dashboard"><DashboardFilled /> Dashboard</Link> },
      ]}
    />
  );

  // === Form Submit ===
  const onFinish = async (values) => {
    try {
      if (isRegistering) {
        await api.post('/auth/register', values);
        enqueueSnackbar('Registration successful! You can now login.', { variant: 'success' });
        setIsRegistering(false);
      } else {
        const res = await api.post('/auth/login', values);
        setUser(res.data.user);
        localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
        localStorage.setItem('filebankToken', res.data.token);
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/dashboard');
      }
      setIsModalVisible(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed', { variant: 'error' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url('/hero-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2rem',
    }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(6px)', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.8)' }}>
        <Title level={3} style={{ margin: 0, color: '#0B3D91' }}>FileBank</Title>
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
              onSuccess={handleLoginSuccess}
              onError={() => message.error('Google login failed')}
              useOneTap
              shape="circle"
            />
            <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ background: '#0B3D91', borderRadius: '30px' }}>
              Login / Register
            </Button>
          </Space>
        )}
      </div>

      {/* Hero Content */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '4rem 2rem',
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        maxWidth: '900px',
        margin: '4rem auto'
      }}>
        <Title style={{ color: '#0B3D91', fontSize: '3rem', marginBottom: '1rem' }}>Secure File Storage</Title>
        <Paragraph style={{ fontSize: '1.2rem', color: '#444' }}>
          Upload, manage and access your files anywhere with <strong>FileBank</strong>.
        </Paragraph>
        <Button size="large" style={{
          marginTop: '2rem',
          padding: '0 2rem',
          background: '#1E90FF',
          borderRadius: '30px',
          color: '#fff',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(30,144,255,0.4)'
        }} onClick={() => setIsModalVisible(true)}>
          Get Started
        </Button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#555', fontSize: '0.85rem', marginTop: '2rem' }}>
        <Space>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <span>© {new Date().getFullYear()} Quorvex Institute</span>
        </Space>
      </div>

      {/* Modal */}
      <Modal
        title={isRegistering ? "Create Account" : "Login to FileBank"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <Form layout="vertical" onFinish={onFinish}>
          {isRegistering && (
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="Enter your name" />
            </Form.Item>
          )}
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', background: '#1E90FF' }}>
              {isRegistering ? "Register" : "Login"}
            </Button>
          </Form.Item>
          <Form.Item>
            <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

