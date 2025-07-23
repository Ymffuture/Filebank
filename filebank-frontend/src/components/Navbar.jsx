// --- IMPORTS ---
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message, Tag, Tooltip } from 'antd';
import {
  BellOutlined,
  DashboardOutlined,
  FileOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  UserOutlined,
  LockOutlined,
  BgColorsOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFeedback } from 'react-icons/md';
import api from '../api/fileApi';
import NotificationsModal from './NotificationsModal';
import logo from '/Branded.svg';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const navigate = useNavigate();

  const plan = user?.role;
  const isFree = plan === 'free';
  const isStandard = plan === 'standard';
  const isModerator = plan === 'moderator';
  const isPremium = plan === 'premium';

  const toastLock = (messageText = 'This feature is restricted to premium users.') => {
    message.info(messageText);
    navigate('/change-plan');
  };

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
      navigate('/google-loading');
    } catch {
      message.error('Login failed.');
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('filebankUser');
    localStorage.removeItem('filebankToken');
    setUser(null);
    navigate('/signing-out');
    message.info('Logged out');
  };

  const userMenu = (
    <Menu
      items={[
        { key: '1', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
        isFree && {
          key: '2', icon: <LockOutlined />, label: (
            <Tooltip title="Premium only">
              <span style={{ color: '#999' }}>Feedback <LockOutlined /></span>
            </Tooltip>
          ),
          onClick: () => toastLock('Upgrade your plan to send feedback.'),
        },
        !isFree && {
          key: '2', icon: <MdOutlineFeedback />, label: 'Feedback', onClick: () => navigate('/feedback')
        },
        { key: '3', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ].filter(Boolean)}
    />
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'gold';
      case 'moderator': return 'purple';
      case 'premium': return 'cyan';
      case 'standard': return 'blue';
      case 'free': return 'gray';
      default: return 'default';
    }
  };

  const drawerItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Home', link: '/' },
    { key: 'about', icon: <InfoCircleOutlined />, label: 'About Us', link: '/about-us' },
    { key: 'files', icon: <FileOutlined />, label: 'Files', link: '/files' },
    user?.role === 'admin' && { key: 'admin', icon: <DashboardOutlined />, label: 'Admin Panel', link: '/admin' },
    { key: 'plan', icon: <DollarOutlined />, label: 'Change Plan', link: '/change-plan' },
    (!isPremium && { key: 'ai', icon: <LockOutlined />, label: 'AI Assistant', onClick: () => toastLock('AI is only available for Premium users.') }),
    (!isPremium && { key: 'fullscreenai', icon: <LockOutlined />, label: 'Full-screen AI', onClick: () => toastLock('Full-screen AI is only for Premium users.') }),
    (isPremium || isStandard) && { key: 'theme', icon: <BgColorsOutlined />, label: 'Change Header Color', link: '/theme-settings' },
    (!isPremium && (isModerator || isFree)) && { key: 'cv', icon: <LockOutlined />, label: 'CV & Cover Letter Tips', onClick: () => toastLock('Premium only.') },
    (!isPremium && isModerator) && { key: 'agent', icon: <LockOutlined />, label: 'Agent Page', onClick: () => toastLock('Premium only.') },
  ].filter(Boolean);

  const profilePic = user?.picture;

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-300" />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" items={drawerItems.slice(0, 4)} className="bg-[#1E90FF] google-menu" />
        </div>

        <div className='flex'>
          <Button 
            type="text"
            className="md:hidden text-[26px] relative text-white"
            onClick={() => setDrawerVisible(true)}
            icon={<MenuOutlined className="text-white" />}
          />
          <Space>
            <Dropdown overlay={userMenu}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={profilePic} icon={<UserOutlined />} />
              </Space>
            </Dropdown>
          </Space>
        </div>
      </Header>

      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', background: '#0B3D91' }}
      >
        <div className="p-2 flex items-center gap-4">
          {profilePic ? <Avatar src={profilePic} size={32} /> : <Avatar size={32} icon={<UserOutlined />} />}
          <div>
            <div className="font-semibold text-white text-[14px]">{user?.displayName || 'Guest'}</div>
            <div className="text-[10px] text-white/80">{user?.email}</div>
          </div>
          {user?.role !== 'premium' && (
            <Tag color={getRoleColor(user.role)}>{user.role.replace(/_/g, ' ').toUpperCase()}</Tag>
          )}
        </div>

        <Menu
          mode="inline"
          items={drawerItems.map(item => ({
            ...item,
            label: item.link ? <Link to={item.link}>{item.icon} {item.label}</Link> : <span onClick={item.onClick}>{item.icon} {item.label}</span>,
            style: { fontWeight: 400, fontSize: '1.05rem', paddingLeft: '24px', color: '#eee' },
            onClick: () => setDrawerVisible(false),
          }))}
          className="flex-grow overflow-auto"
        />

        <div className="p-1 space-y-2 bg-[#fff] dark:bg-gray-900 text-white ">
          <Button
            block
            type="link"
            icon={<BellOutlined style={{ color: '#fff' }} />}
            onClick={() => {
              setNotifModalVisible(true);
              setDrawerVisible(false);
            }}
            style={{ fontWeight: '400', fontSize: '1rem' }}
          >
            Notifications
            <Badge count={notifications} offset={[6, 0]} style={{ backgroundColor: '#0B3D91', color: '#fff', marginLeft: 8 }} />
          </Button>

          {!isFree && (
            <Button
              block
              type="link"
              onClick={() => {
                navigate('/feedback');
                setDrawerVisible(false);
              }}
              style={{ fontWeight: '400', fontSize: '1rem' }}
            >
              Feedback
            </Button>
          )}

          {user ? (
            <Button
              block
              type="link"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg m-3"
              style={{ margin: '4px' }}
            >
              Logout
            </Button>
          ) : (
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

