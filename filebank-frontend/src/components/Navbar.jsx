import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, message } from 'antd';
import { BellOutlined, DashboardOutlined, FileOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import api from '../api/fileApi';
import logo from '/vite.svg';
import { Link, useNavigate } from 'react-router-dom';

const { Header } = Layout;

export default function Navbar() {
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
      const res = await api.get('/notifications');
      setNotifications(res.data.count || 0);
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const res = await api.post('/auth/google-login', { credential });
      const userData = res.data.user;
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('filebankUser', JSON.stringify(userData));
      localStorage.setItem('filebankToken', token);

      message.success('Login successful!');
      fetchNotifications();
      navigate('/');
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
  };

  const userMenu = (
    <Menu
      items={[
        { key: '1', label: <span onClick={handleLogout}>Logout</span> },
        { key: '2', label: <Link to="/profile">Profile</Link> },
      ]}
    />
  );

  const mainMenuItems = [
    {
      key: 'dashboard',
      label: (
        <Link to="/dashboard" className="flex items-center gap-1">
          <DashboardOutlined /> Dashboard
        </Link>
      ),
    },
    {
      key: 'files',
      label: (
        <Link to="/files" className="flex items-center gap-1">
          <FileOutlined /> Files
        </Link>
      ),
    },
      {
      key: 'dashboard',
      label: (
        <Link to="/about" className="flex items-center gap-1">
          <InfoCircleOutlined/> About Us
        </Link>
      ),
    },
    user?.role === 'admin' && {
      key: 'admin',
      label: (
        <Link to="/admin" className="flex items-center gap-1">
          Admin Panel
        </Link>
      ),
    },
  ].filter(Boolean);

  // Extract profile picture safely, fallback to null
const profilePic = user?.picture || user?.photo || user?.avatar || null;


  // Extract initials from user name as fallback avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Header className="sticky top-2 z-50 bg-[#adc6df] px-4 flex flex-wrap justify-between items-center shadow rounded">
      <Space>
        <img src={logo} alt="FileBank Logo" className="w-20 h-8" />
        <span className="text-white md:block hidden">Powered by Qurovex</span>
        <Menu mode="horizontal" theme="dark" items={mainMenuItems} className="bg-transparent text-white" />
      </Space>

      <Space>
        {user ? (
          <>
            <Badge count={notifications} offset={[0, 5]}>
              <BellOutlined className="text-white text-lg cursor-pointer" onClick={fetchNotifications} />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <Space className="cursor-pointer text-white">
                {profilePic ? (
                  <Avatar src={profilePic} size="large" />
                ) : (
                  <Avatar size="large" style={{ backgroundColor: '#1890ff', color: '#fff' }}>
                    {initials}
                  </Avatar>
                )}
                <span>{user.role?.toUpperCase()}</span>
              </Space>
            </Dropdown>
          </>
        ) : (
          <GoogleLogin onSuccess={handleLoginSuccess} onError={() => message.error('Login failed.')} />
        )}
      </Space>
    </Header>
  );
}
