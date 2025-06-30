import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Button, Typography, message, Avatar, Dropdown, Menu, Badge, Space } from 'antd';
import { BellOutlined, DownOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';

const { Title, Paragraph } = Typography;

export default function Hero() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications'); // Your backend endpoint
      setNotifications(res.data.count || 0);
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;

      // Backend validation of token and login
      const res = await api.post('/auth/google-login', { credential });

      const userData = res.data.user;
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('filebankUser', JSON.stringify(userData));
      localStorage.setItem('filebankToken', token);

      message.success('Login successful!');
      fetchNotifications();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      message.error('Login failed.');
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('filebankUser');
    localStorage.removeItem('filebankToken');
    setUser(null);
    message.info('Logged out');
    navigate('/');
  };

  const userMenu = (
    <Menu
      items={[
        { key: '1', label: <span onClick={handleLogout}>Logout</span> },
        { key: '2', label: <Link to="/profile">Profile</Link> },
      ]}
    />
  );

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-[#d6d6d6] via-blue-700 to-blue-900 text-white p-6 text-center rounded shadow-lg mb-4 mx-auto">
      <Title level={1} style={{ color: '#fff', fontWeight: 'bold' }}>
        Welcome to FileBank
      </Title>
      <Paragraph style={{ fontSize: '1.2rem', maxWidth: 600, marginBottom: 40 }}>
        Securely upload, manage, and access your files anytime, anywhere. Powered by Qurovex technology.
      </Paragraph>

      <div className="flex gap-6 flex-wrap justify-center items-center">
        {user ? (
          <>
            <Badge count={notifications} offset={[0, 5]}>
              <BellOutlined
                className="text-white text-2xl cursor-pointer"
                onClick={fetchNotifications}
                title="Notifications"
              />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomCenter" trigger={['click']}>
              <Space className="cursor-pointer text-white" align="center">
                <Avatar src={user.picture} alt={user.name} />
                <span className="font-semibold">{user.name}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => message.error('Google login failed.')}
            useOneTap
          />
        )}
      </div>
    </div>
  );
}
