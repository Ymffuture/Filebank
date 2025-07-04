import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message } from 'antd';
import { BellOutlined, DashboardOutlined, FileOutlined, HomeOutlined, InfoCircleOutlined, MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/fileApi';
import NotificationsModal from './NotificationsModal';
import logo from '/vite.svg';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const navigate = useNavigate();

  const playSound = () => {
    const audio = new Audio('/mix.mp3');
    audio.play().catch(() => {
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
        { key: '1', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
        { key: '2', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
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

  return (
    <Header style={{ backgroundColor: '#fff' }} className="flex justify-between items-center shadow sticky top-0 z-50">
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
                className="text-white text-[30px] cursor-pointer select-none"
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
                <span className="text-[#333] text-[10px]">{user.role?.toUpperCase()}</span>
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
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Menu
            mode="vertical"
            items={mainMenuItems}
            onClick={() => setDrawerVisible(false)}
          />
          <div style={{ marginTop: 'auto', textAlign: 'center', padding: '16px' }}>
            <Space size="large">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={24} />
              </a>
            </Space>
          </div>
        </div>
      </Drawer>
    </Header>
  );
}
