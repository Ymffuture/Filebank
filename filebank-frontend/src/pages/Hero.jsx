import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space, Row, Col, Card, Modal } from 'antd';
import { BellOutlined, DashboardFilled, DownOutlined, LogoutOutlined, LockOutlined, SmileOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
// import { useAuth } from '../context/AuthContext';
const { Title, Paragraph } = Typography;
// const { setUser } = useAuth();
const ratColors = {
  blue: '#1E90FF',
  gold: '#FFD700',
  green: '#32CD32',
  lightBlue: '#F0F8FF',
  accent: '#FFC107', // gold accent for links
  darkBlue: '#0B3D91',
};

export default function Hero() {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.count || 0);
    } catch {
      // silently fail
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const res = await api.post('/auth/google-login', { credential });

      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);
      
      enqueueSnackbar('Login successful!', { variant: 'success' });
      fetchNotifications();
      navigate('/dashboard');

      
    } catch {
      console.error('Error message: Failed');
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        {user ? (
          <>
            <Badge count={notifications} offset={[0, 6]} size="small">
              <BellOutlined style={{ fontSize: 28, color: 'black' }} onClick={fetchNotifications} title="Notifications" />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomCenter" trigger={['click']}>
              <Space style={{ cursor: 'pointer', alignItems: 'center', gap: 8 }}>
                <Avatar src={user.picture} size={40} />
                <span>{user.name || user.displayName}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </>
        ) : (
          <Space>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => message.error('Google login failed.')}
              useOneTap
              shape="circle"
              size="large"
            />
            <Button type="primary" onClick={showModal} style={{ backgroundColor: ratColors.blue, borderColor: ratColors.blue }}>
              Login with Email
            </Button>
          </Space>
        )}
      </div>

      {/* Hero Content */}
      <div style={{ 
        background: `linear-gradient(to bottom, ${ratColors.lightBlue}, #ffffff)`, 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        marginBottom: '4rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Title level={1} style={{ color: ratColors.darkBlue }}>
          Welcome to <span style={{ color: ratColors.gold }}>FileBank</span>
        </Title>
        <Paragraph style={{ fontSize: '1.25rem', color: ratColors.darkBlue }}>
          Securely upload, organize, and access your files anywhere, anytime.
        </Paragraph>
        <Paragraph style={{ fontSize: '1rem', marginTop: '1rem', color: ratColors.darkBlue }}>
          Powered by <strong>Quorvex</strong> technology and protected with industry-leading security standards.
        </Paragraph>
      </div>

      {/* Trust-Building Section */}
      <div style={{ marginBottom: '4rem' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem', color: ratColors.darkBlue }}>
          Why Trust FileBank?
        </Title>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <LockOutlined style={{ fontSize: 32, color: ratColors.blue }} />
              <Title level={4} style={{ color: ratColors.darkBlue }}>Security</Title>
              <Paragraph>Your files are encrypted and stored securely with top-tier protection.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <SmileOutlined style={{ fontSize: 32, color: ratColors.green }} />
              <Title level={4} style={{ color: ratColors.darkBlue }}>Ease of Use</Title>
              <Paragraph>Intuitive interface to manage your files effortlessly.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <GlobalOutlined style={{ fontSize: 32, color: ratColors.accent }} />
              <Title level={4} style={{ color: ratColors.darkBlue }}>Accessibility</Title>
              <Paragraph>Access your files from any device, anywhere, anytime.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <SettingOutlined style={{ fontSize: 32, color: ratColors.gold }} />
              <Title level={4} style={{ color: ratColors.darkBlue }}>Control</Title>
              <Paragraph>You have full control over your files and storage space.</Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Space>
          <Link to="/terms" style={{ color: ratColors.accent }}>Terms of Service</Link>
          <Link to="/privacy" style={{ color: ratColors.accent }}>Privacy Policy</Link>
        </Space>
      </div>

      {/* Modal for Email Login */}
      <Modal
        title="Login with Email"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="ok" type="primary" onClick={handleOk} style={{ backgroundColor: ratColors.blue, borderColor: ratColors.blue }}>
            OK
          </Button>,
        ]}
      >
        <Paragraph>This feature is coming soon. Stay tuned!</Paragraph>
      </Modal>
    </div>
  );
}
