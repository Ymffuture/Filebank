import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space } from 'antd';
import { BellOutlined, DashboardFilled, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
const { Title, Paragraph, Text } = Typography;
import CustomButton from '../components/ui/AppButton';


const ratColors = {
  blue: '#1E90FF',
  gold: '#FFD700',
  green: '#32CD32',
  lightBlue: '#F0F8FF',
  accent: '#FFC107', // gold accent for links
  darkBlue: '#0B3D91',
};

export default function Hero() {
 const {enqueueSnackbar} = useSnackbar()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
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
      
      enqueueSnackbar('Login successful!',{variant:'success'});
      fetchNotifications();
      navigate('/dashboard');
    } catch {
      console.error('Error message :Failed') 
     enqueueSnackbar('Google login failed.',{variant:'error'});
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
        { key: '1', label: <span onClick={handleLogout}><LogoutOutlined/> Logout</span> },
        
        { key: '23', label: <Link to="/dashboard"><DashboardFilled/> Dashboard</Link> },
      ]}
    />
  );

  return (
    <div
      style={{
        minHeight: '85vh',
        padding: '3rem 1.5rem',
        color: 'white',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: `radial-gradient(circle at top left, ${ratColors.blue} 0%, ${ratColors.gold} 20%, ${ratColors.green} 40%, ${ratColors.darkBlue} 60%, ${ratColors.blue} 80%, ${ratColors.lightBlue} 100%)`,
        borderRadius: '8px',
        maxWidth: 1260,
        margin: '2rem auto',
        boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
      }}
    >
      <Title level={1} style={{ fontWeight: '800', marginBottom: 12, textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
        Welcome to <span style={{ color: ratColors.gold }}>FileBank</span>
      </Title>
      <Paragraph
        style={{
          fontSize: '1.25rem',
          maxWidth: 600,
          margin: '0 auto 2rem',
          lineHeight: 1.6,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        Securely upload, organize, and access your files anywhere, anytime. Powered by <strong>Quorvex</strong>{' '}
        technology and protected with industry-leading security standards.
      </Paragraph>

      <div className="flex flex-wrap justify-center items-center gap-8">
        {user ? (
          <>
            <Badge count={notifications} offset={[0, 6]} size="small">
              <BellOutlined
                style={{ fontSize: 28, color: 'white', cursor: 'pointer' }}
                onClick={fetchNotifications}
                title="Notifications"
              />
            </Badge>

            <Dropdown overlay={userMenu} placement="bottomCenter" trigger={['click']} className='p-4'>
              <Space
                style={{
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: 80,
                  padding: '8px 16px',
                  background: ratColors.gold,
                  borderRadius: 10,
                  color: ratColors.darkBlue,
                  fontWeight: '600',
                  boxShadow: '0 4px 14px rgba(255, 215, 0, 0.5)',
                  userSelect: 'none',
                }}
              >
                <Avatar src={user.picture} size={40} />
                <span>{user.name || user.displayName}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => message.error('Google login failed.')}
            useOneTap
            shape="circle"
            size="large"
          />
        )}
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: '3rem',
          maxWidth: 680,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: 'rgba(255 255 255 / 0.12)',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)',
          fontSize: '1rem',
          lineHeight: 1.5,
          color: ratColors.lightBlue,
          textAlign: 'left',
        }}
      >
        <Title level={3} style={{ color: ratColors.gold }}>
          How It Works
        </Title>
        <Paragraph>
          1. <b>Sign in with Google</b> to securely access your personal FileBank account.
        </Paragraph>
        <Paragraph>
          2. <b>Upload and manage</b> your files effortlessly using our intuitive dashboard.
        </Paragraph>
        <Paragraph>
          3. Receive real-time <b>notifications</b> for important updates and file activity.
        </Paragraph>
        <Paragraph>
          4. Your files are protected with industry-standard encryption and stored securely in the cloud.
        </Paragraph>
      </div>

      {/* Footer links */}
      <div
        style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.9rem',
          color: ratColors.accent,
        }}
      >
        <Link to="/terms" style={{ color: ratColors.accent, textDecoration: 'underline' }}>
          Terms of Service
        </Link>
        <span>|</span>
        <Link to="/privacy" style={{ color: ratColors.accent, textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
      </div>
      <div>
      <h1>Login with EMAIL</h1>
      <CustomButton onClick={() => alert('Clicked!')}>
        Get started
      </CustomButton>
    </div>
    </div>
  );
}
