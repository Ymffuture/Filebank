import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message, Tag } from 'antd';
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
        {
          key: '2',
          icon: <MdOutlineFeedback />,
          label: 'Feedback',
          onClick: () => {
            if (user?.role === 'free') {
              message.warning('Upgrade to premium to access feedback');
              navigate('/change-plan');
            } else {
              navigate('/feedback');
            }
          },
        },
        { key: '3', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ]}
    />
  );

  const showUpgradeMessage = (feature) => {
    message.warning(`Upgrade to premium to access ${feature}`);
    navigate('/change-plan');
  };

  const drawerMenuItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined />, path: '/' },
    { key: 'about', label: 'About Us', icon: <InfoCircleOutlined />, path: '/about-us' },
    { key: 'files', label: 'Files', icon: <FileOutlined />, path: '/files' },
    user?.role === 'admin' && { key: 'admin', label: 'Admin Panel', icon: <DashboardOutlined />, path: '/admin' },
    { key: 'change-plan', label: 'Change Plan', icon: <LockOutlined />, path: '/change-plan' },
    {
      key: 'ai',
      label: 'AI Assistant',
      icon: <LockOutlined />,
      path: user?.role === 'free' || user?.role === 'moderator' ? null : '/full-screen-ai',
      onClick: () => {
        if (user?.role === 'free' || user?.role === 'moderator') showUpgradeMessage('AI Assistant');
        else navigate('/full-screen-ai');
      },
    },
    {
      key: 'cv-agent',
      label: 'CV Agent & Tips',
      icon: <LockOutlined />,
      path: user?.role === 'free' || user?.role === 'moderator' ? null : '/cv-agent',
      onClick: () => {
        if (user?.role === 'free' || user?.role === 'moderator') showUpgradeMessage('CV Agent & Tips');
        else navigate('/cv-agent');
      },
    },
    {
      key: 'customize',
      label: 'Customize Header',
      icon: <BgColorsOutlined />,
      onClick: () => {
        if (['premium', 'standard'].includes(user?.role)) {
          navigate('/customize-header');
        } else {
          showUpgradeMessage('header customization');
        }
      },
    },
  ].filter(Boolean);

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

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-300" />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" items={drawerMenuItems.filter(i => i.path)} className="bg-[#1E90FF] google-menu" />
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
                <Avatar src={user?.picture} icon={<UserOutlined />} />
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
          {user?.picture ? (
            <Avatar src={user.picture} size={32} />
          ) : (
            <Avatar size={32} icon={<UserOutlined />} />
          )}
          <div>
            <div className="font-semibold text-white text-[14px]">
              {user?.role !== 'free' ? user?.displayName : 'Anonymous'}
            </div>
            <div className="text-[10px] text-white/80">{user?.email}</div>
          </div>
          {user?.role !== 'premium' && (
            <Tag color={getRoleColor(user?.role)}>{user?.role?.toUpperCase()}</Tag>
          )}
        </div>

        <Menu
          mode="inline"
          items={drawerMenuItems.map(item => ({
            ...item,
            onClick: item.onClick || (() => navigate(item.path)),
            style: { fontWeight: 400, fontSize: '1.05rem', paddingLeft: '24px', color: '#fff' },
          }))}
          className="flex-grow overflow-auto"
        />

        <div className="p-1 space-y-2 bg-[#fff] dark:bg-gray-900 text-white">
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

          <Button
            block
            type="link"
            onClick={() => {
              if (user?.role === 'free') showUpgradeMessage('Feedback');
              else navigate('/feedback');
              setDrawerVisible(false);
            }}
            icon={<MdOutlineFeedback style={{ color: user?.role === 'free' ? 'red' : 'inherit' }} />}
            style={{ fontWeight: '400', fontSize: '1rem' }}
          >
            Feedback
          </Button>

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

