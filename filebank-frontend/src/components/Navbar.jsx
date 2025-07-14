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
  GoogleOutlined,
  LogoutOutlined,
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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const newCount = res.data.count || 0;
      if (newCount > notifications) playSound();
      setNotifications(newCount);
    } catch {}
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 5000);
    return () => clearInterval(iv);
  }, [user, fetchNotifications]);

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
        { key: '1', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
        { key: '2', icon: <MdOutlineFeedback />, label: 'Feedback', onClick: () => navigate('/feedback') },
        { key: '3', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ]}
    />
  );

  const mainMenuItems = [
    { key: 'home', label: <Link to="/"><HomeOutlined /> Home</Link> },
    { key: 'about', label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link> },
    { key: 'files', label: <Link to="/files"><FileOutlined /> Files</Link> },
    user?.role === 'admin' && { key: 'admin', label: <Link to="/admin"><DashboardOutlined /> Admin Panel</Link> },
  ].filter(Boolean);

  const profilePic = user?.picture;

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="FileBank Logo" className="w-20 h-20 md:w-20 md:h-20 scale-200" />
          <span className="text-[gray] text-[18px]">Filebank Cloud</span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal"  items={mainMenuItems} className="bg-transparent google-menu" />
        </div>

        {/* Mobile menu button */}
        <Button
          type="text"
          className="md:hidden text-[22px] relative text-white"
          onClick={() => setDrawerVisible(true)}
          icon={
            <>
              <MenuOutlined className="text-white" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 block w-2 h-2 bg-[royalblue] rounded-full" />
              )}
            </>
          }
        />
      </Header>

      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%',background:'#0B3D91' }}
      >
        {/* Profile header with gradient */}
        <div className="p-1 bg-gradient-to-r from-[#000] via-[#333] to-[gray] flex items-center gap-3">
          {profilePic ? (
            <Avatar src={profilePic} size={64} />
          ) : (
            <Avatar size={64} icon={<UserOutlined />} />
          )}
          <div>
            <div className="font-semibold text-white text-[14px]">{user?.displayName || 'Guest'}</div>
            <div className="text-[10px] text-white/80">{user?.email}</div>
          </div>
        </div>

        {/* Navigation */}
        <Menu
          mode="inline"
          theme="light"
          items={mainMenuItems.map(item => ({
            ...item,
            onClick: () => setDrawerVisible(false),
            style: { fontWeight: 600, fontSize: '1.05rem', paddingLeft: '24px' },
          }))}
          className="flex-grow overflow-auto bg-[#0B3D91]"
        />

        {/* Footer buttons */}
        <div className="p-4 space-y-4 bg-[#0B3D91] dark:bg-gray-900 text-white ">
          <Button
            block
            type="link"
            icon={<BellOutlined style={{ color: '#fff' }} />}
            onClick={() => {
              setNotifModalVisible(true);
              setDrawerVisible(false);
            }}
            style={{ fontWeight: '600', fontSize: '1rem' }}
          >
            Notifications
            <Badge
              count={notifications}
              offset={[6, 0]}
              style={{ backgroundColor: '#0B3D91', color: '#fff', marginLeft: 8 }}
            />
          </Button>

          <Button
            block
            type="link"
            onClick={() => {
              navigate('/feedback');
              setDrawerVisible(false);
            }}
            style={{ fontWeight: '600', fontSize: '1rem' }}
          >
            Feedback
          </Button>

          {user ? (
            <Button
                block
              type="link" 
    
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg m-3"
              >
                Logout
              </Button>
          ) : (
        <hr/>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => message.error('Login failed.')}
                shape="pill"
                theme="filled_blue"
                text="signin_with"
                useOneTap
              />
          )}
        </div>
      </Drawer>

      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </>
  );
}
