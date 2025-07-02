import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message } from 'antd';
import { BellOutlined, DashboardOutlined, FileOutlined, HomeOutlined, InfoCircleOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import NotificationsModal from './NotificationsModal';
import logo from '/vite.svg';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const navigate = useNavigate();

  const playSound = () => {
    const audio = new Audio('/mix.wav');
    audio.play().catch(() => {
      // Fallback beep
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const newCount = res.data.count || 0;
      if (newCount > notifications) {
        playSound();
      }
      setNotifications(newCount);
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const res = await api.post('/auth/google-login', { credential });
      const userData = res.data.user;
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('filebankUser', JSON.stringify(userData));
      localStorage.setItem('filebankToken', token);

      fetchNotifications();
      navigate('/');
    } catch {
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
      key: 'home',
      label: <Link to="/"><HomeOutlined /> Home</Link>
    },
    {
      key: 'about',
      label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link>
    },
    {
      key: 'files',
      label: <Link to="/files"><FileOutlined /> Files</Link>
    },
    user?.role === 'admin' && {
      key: 'admin',
      label: <Link to="/admin"><DashboardOutlined /> Admin Panel</Link>
    }
  ].filter(Boolean);

  const profilePic = user?.picture;
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'FB';

  return (
    <Header className="bg-[#adc6df] px-4 flex justify-between items-center shadow rounded sticky top-0 z-50">
      <Space>
  <img
  src={logo}
  alt="FileBank Logo"
  className="w-20 h-20 scale-125"
/>

        <span className="hidden md:block text-white">Powered by Qurovex</span>
      </Space>

      <div className="hidden md:flex">
        <Menu mode="horizontal" theme="dark" items={mainMenuItems} className="bg-transparent text-white" />
      </div>

      <Space className="md:flex hidden">
        {user && (
          <>
            <Badge
              count={notifications}
              offset={[0, 5]}
              style={{
                backgroundColor: '#ADD8E6',
                color: '#fff',
                boxShadow: '0 0 0 1px #fff inset'
              }}
            >
              <BellOutlined
                className="text-white text-[28px] cursor-pointer select-none"
                onClick={() => setNotifModalVisible(true)}
              />
            </Badge>

            <NotificationsModal
              visible={notifModalVisible}
              onClose={() => setNotifModalVisible(false)}
            />

            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <Space className="cursor-pointer">
                {profilePic
                  ? <Avatar src={profilePic} size="large" />
                  : <Avatar size="large" icon={<UserOutlined />} />}
                <span className="text-white">{user.role?.toUpperCase()}</span>
              </Space>
            </Dropdown>
          </>
        )}
        {!user && (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => message.error('Login failed.')}
          />
        )}
      </Space>

      <Button
        type="text"
        icon={<MenuOutlined />}
        className="md:hidden text-white"
        onClick={() => setDrawerVisible(true)}
      />

      <Drawer
        title={
          <Space>
            {profilePic
              ? <Avatar src={profilePic} />
              : <Avatar icon={<UserOutlined />} />}
            <div>
              <div className="font-bold">{user?.displayName || 'Guest'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="vertical"
          items={mainMenuItems}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>
    </Header>
  );
}

