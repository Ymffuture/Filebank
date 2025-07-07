import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message } from 'antd';
import {
  BellOutlined,
  DashboardOutlined,
  FileOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFeedback } from 'react-icons/md';
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

  // Play a small beep on new notifications
  const playSound = () => {
    const audio = new Audio('/mix.mp3');
    audio.play().catch(() => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    });
  };

  // Fetch unread count and beep on new
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const newCount = res.data.count || 0;
      if (newCount > notifications) playSound();
      setNotifications(newCount);
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 5000);
    return () => clearInterval(iv);
  }, [user, fetchNotifications]);

  // Google login success
  const handleLoginSuccess = async (resp) => {
    try {
      const res = await api.post('/auth/google-login', { credential: resp.credential });
      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);
      fetchNotifications();
      navigate('/');
    } catch {
      message.error('Login failed.');
    }
  };

  // Logout
  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('filebankUser');
    localStorage.removeItem('filebankToken');
    setUser(null);
    message.info('Logged out');
  };

  // User dropdown menu
  const userMenu = (
    <Menu
      items={[
        { key: '1', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
        { key: '2', icon: <LogoutOutlined />, label: 'Logout',  onClick: handleLogout }
      ]}
    />
  );

  // Main nav items
  const mainMenuItems = [
    { key: 'home',  label: <Link to="/"><HomeOutlined /> Home</Link> },
    { key: 'about', label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link> },
    { key: 'files', label: <Link to="/files"><FileOutlined /> Files</Link> },
    user?.role === 'admin' && { key: 'admin', label: <Link to="/admin"><DashboardOutlined /> Admin Panel</Link> }
  ].filter(Boolean);

  const profilePic = user?.picture;

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="FileBank Logo" className="w-12 h-12 md:w-16 md:h-16" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" theme="light" items={mainMenuItems} className="bg-transparent" />
        </div>

        {/* Desktop right icons */}
        <Space size="large" className="hidden md:flex items-center">
          {user ? (
            <>
              {/* Notification bell */}
              <Badge
                count={notifications}
                offset={[0, 5]}
                style={{ backgroundColor: '#333', color: '#fff' }}
                className="cursor-pointer"
              >
                <BellOutlined
                  className="text-2xl"
                  onClick={() => setNotifModalVisible(true)}
                />
              </Badge>

              {/* Profile dropdown */}
              <Dropdown overlay={userMenu} trigger={['click']}>
                {profilePic
                  ? <Avatar src={profilePic} size="large" />
                  : <Avatar size="large" icon={<UserOutlined />} />}
              </Dropdown>
            </>
          ) : (
            <GoogleLogin onSuccess={handleLoginSuccess} onError={() => message.error('Login failed.')} />
          )}
        </Space>

        {/* Mobile menu button */}
        <Button
          type="text"
          className="md:hidden text-xl relative"
          onClick={() => setDrawerVisible(true)}
          icon={
            <>
              <MenuOutlined />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full" />
              )}
            </>
          }
        />
      </Header>

      {/* Mobile drawer */}
      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        bodyStyle={{ padding: 0 }}
      >
        {/* Drawer header */}
        <div className="p-4 border-b flex items-center space-x-3">
          {profilePic
            ? <Avatar src={profilePic} size="large" />
            : <Avatar size="large" icon={<UserOutlined />} />}
          <div>
            <div className="font-semibold">{user?.displayName || 'Guest'}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        {/* Drawer navigation */}
        <Menu
          mode="inline"
          items={mainMenuItems.map(item => ({
            ...item,
            onClick: () => setDrawerVisible(false)
          }))}
        />

        {/* Drawer footer buttons */}
        <div className="mt-auto p-4 border-t space-y-3">
          {/* Notifications */}
          <Button
            block
            icon={<BellOutlined />}
            onClick={() => {
              setNotifModalVisible(true);
              setDrawerVisible(false);
            }}
          >
            Notifications
            <Badge
              count={notifications}
              offset={[6, 0]}
              style={{ backgroundColor: '#333', color: '#fff' }}
            />
          </Button>

          {/* Logout / Login */}
          {user ? (
            <Button block icon={<LogoutOutlined />} danger onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <GoogleLogin onSuccess={handleLoginSuccess} onError={() => {}} />
          )}

          {/* Feedback */}
          <Button block type="default" onClick={() => { navigate('/feedback'); setDrawerVisible(false); }}>
            Feedback
          </Button>
        </div>
      </Drawer>

      {/* Notifications modal */}
      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />

      {/* Floating feedback button on large screens */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="hidden lg:flex fixed bottom-6 right-6 items-center justify-center shadow-xl"
        icon={<MdOutlineFeedback size={24} />}
        onClick={() => navigate('/feedback')}
      />
    </>
  );
}

