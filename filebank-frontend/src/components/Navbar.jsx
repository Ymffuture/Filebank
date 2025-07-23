import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message, Tag, Modal } from 'antd';
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
  LockOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFeedback } from 'react-icons/md';
import { AiOutlineRobot } from 'react-icons/ai';
import { FileTextOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import NotificationsModal from './NotificationsModal';
import logo from '/Branded.svg';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [headerColor, setHeaderColor] = useState('#ffffff'); // Default white
  const [showPremiumTag, setShowPremiumTag] = useState(true);
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

  const handleRestrictedAccess = (feature) => {
    message.warning(`Please upgrade your plan to access ${feature}`);
    navigate('/change-plan');
  };

  const handleColorChange = (color) => {
    setHeaderColor(color);
  };

  const colorMenu = (
    <Menu
      items={[
        { key: '1', label: 'Blue', onClick: () => handleColorChange('#1E90FF') },
        { key: '2', label: 'Green', onClick: () => handleColorChange('#52c41a') },
        { key: '3', label: 'Purple', onClick: () => handleColorChange('#722ed1') },
      ]}
    />
  );

  const userMenu = (
    <Menu
      items={[
        { key: '1', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
        { key: '2', icon: <MdOutlineFeedback />, label: 'Feedback', onClick: () => {
          if (user?.role === 'free') {
            handleRestrictedAccess('Feedback');
          } else {
            navigate('/feedback');
          }
        }},
        (user?.role === 'premium' || user?.role === 'standard') && {
          key: '3',
          icon: <BgColorsOutlined />,
          label: 'Change Header Color',
          children: [
            { key: '3-1', label: 'Blue', onClick: () => handleColorChange('#1E90FF') },
            { key: '3-2', label: 'Green', onClick: () => handleColorChange('#52c41a') },
            { key: '3-3', label: 'Purple', onClick: () => handleColorChange('#722ed1') },
          ],
        },
        { key: '4', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ].filter(Boolean)}
    />
  );

  const mainMenuItems = [
    { key: 'home', label: <Link to="/"><HomeOutlined /> Home</Link> },
    { key: 'about', label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link> },
    { key: 'files', label: <Link to="/files"><FileOutlined /> Files</Link> },
    user?.role === 'admin' && { key: 'admin', label: <Link to="/admin"><DashboardOutlined /> Admin Panel</Link> },
    {
      key: 'ai',
      label: (
        <span onClick={() => {
          if (['free', 'moderator', 'standard'].includes(user?.role)) {
            handleRestrictedAccess('AI Features');
          } else {
            navigate('/full-screen-ai');
          }
        }}>
          <AiOutlineRobot /> AI Features {['free', 'moderator', 'standard'].includes(user?.role) && <LockOutlined />}
        </span>
      ),
    },
    {
      key: 'cv-tips',
      label: (
        <span onClick={() => {
          if (['free', 'moderator'].includes(user?.role)) {
            handleRestrictedAccess('CV & Cover Letter Tips');
          } else {
            navigate('/cv-tips');
          }
        }}>
          <FileTextOutlined /> CV & Cover Letter Tips {['free', 'moderator'].includes(user?.role) && <LockOutlined />}
        </span>
      ),
    },
    {
      key: 'agent',
      label: (
        <span onClick={() => {
          if (['free', 'moderator'].includes(user?.role)) {
            handleRestrictedAccess('Agent');
          } else {
            navigate('/agent');
          }
        }}>
          <UserOutlined /> Agent {['free', 'moderator'].includes(user?.role) && <LockOutlined />}
        </span>
      ),
    },
    { key: 'change-plan', label: <Link to="/change-plan"><UserOutlined /> Change Plan</Link> },
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
      <Header className="flex justify-between items-center shadow sticky top-0 z-50 px-4" style={{ background: headerColor }}>
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-300" />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" items={mainMenuItems} className="bg-[#1E90FF] google-menu" />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="text"
            className="md:hidden text-[26px] relative text-white"
            onClick={() => setDrawerVisible(true)}
            icon={
              <>
                <MenuOutlined className="text-white" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 block w-2 h-2 bg-[pink] rounded-full" />
                )}
              </>
            }
          />
          <Space>
            <Dropdown overlay={userMenu}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user?.picture} icon={<UserOutlined />} />
                {user?.displayName && <span className="text-white">{user.displayName}</span>}
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
          {profilePic ? (
            <Avatar src={profilePic} size={32} />
          ) : (
            <Avatar size={32} icon={<UserOutlined />} />
          )}
          <div>
            <div className="font-semibold text-white text-[14px]">{user?.displayName || 'Guest'}</div>
            <div className="text-[10px] text-white/80">{user?.email}</div>
          </div>
          {showPremiumTag && (
            <Tag
              color={getRoleColor(user?.role)}
              onClick={() => setShowPremiumTag(false)}
              style={{ cursor: 'pointer' }}
            >
              {user?.role?.replace(/_/g, ' ').toUpperCase()}
            </Tag>
          )}
        </div>

        <Menu
          mode="inline"
          items={mainMenuItems.map(item => ({
            ...item,
            onClick: () => {
              if (item.key === 'ai' && ['free', 'moderator', 'standard'].includes(user?.role)) {
                handleRestrictedAccess('AI Features');
              } else if (item.key === 'cv-tips' && ['free', 'moderator'].includes(user?.role)) {
                handleRestrictedAccess('CV & Cover Letter Tips');
              } else if (item.key === 'agent' && ['free', 'moderator'].includes(user?.role)) {
                handleRestrictedAccess('Agent');
              } else {
                setDrawerVisible(false);
              }
            },
            style: { fontWeight: 400, fontSize: '1.05rem', paddingLeft: '24px', color: '#666' },
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
            <Badge
              count={notifications}
              offset={[6, 0]}
              style={{ backgroundColor: '#0B3D91', color: '#fff', marginLeft: 8 }}
            />
          </Button>

          <Button
            block
            type="link"
            icon={user?.role === 'free' ? <LockOutlined /> : <MdOutlineFeedback />}
            onClick={() => {
              if (user?.role === 'free') {
                handleRestrictedAccess('Feedback');
              } else {
                navigate('/feedback');
                setDrawerVisible(false);
              }
            }}
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
