import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer, message, Tag, Tooltip,
} from 'antd';
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
  RobotOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  CreditCardOutlined,
  LockOutlined,
  SwapOutlined,
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

  const handleChangeRole = async () => {
    if (!user?._id || !user?.role) return;
    const newRole = user.role === 'admin' ? 'account' : 'admin';
    try {
      const res = await api.put(`/admin/users/${user._id}/role`, { role: newRole });
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('filebankUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success(`Role changed to ${newRole}`);
    } catch (error) {
      console.error('Role change failed:', error);
      message.error('Failed to change role');
    }
  };

  const canAccess = (feature) => {
    const role = user?.role;
    if (!role) return false;
    switch (feature) {
      case 'feedback': return role !== 'free';
      case 'ai': return ['premium', 'admin'].includes(role);
      case 'cv-tips':
      case 'coverletter-tips':
      case 'agent':
        return ['standard', 'premium', 'admin'].includes(role);
      default: return true;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'gold';
      case 'moderator': return 'purple';
      case 'premium': return 'cyan';
      case 'standard': return 'blue';
      case 'account':
      case 'free': return 'gray';
      default: return 'default';
    }
  };

  const menuItems = [
    { key: 'home', label: 'Home', icon: <HomeOutlined />, path: '/' },
    { key: 'about', label: 'About Us', icon: <InfoCircleOutlined />, path: '/about-us' },
    { key: 'files', label: 'Files', icon: <FileOutlined />, path: '/files' },
    user?.role === 'admin' && { key: 'admin', label: 'Admin Panel', icon: <DashboardOutlined />, path: '/admin' },
    { key: 'ai', label: 'AI Features', icon: <RobotOutlined />, path: '/full-screen-ai', feature: 'ai' },
    { key: 'cv-tips', label: 'CV Tips', icon: <FileTextOutlined />, path: '/cv-tips', feature: 'cv-tips' },
    { key: 'coverletter-tips', label: 'Cover Letter Tips', icon: <FileTextOutlined />, path: '/coverletter-tips', feature: 'cv-tips' },
    { key: 'agent', label: 'Agent', icon: <CustomerServiceOutlined />, path: '/agent', feature: 'agent' },
    { key: 'feedback', label: 'Feedback', icon: <MdOutlineFeedback />, path: '/feedback', feature: 'feedback' },
    { key: 'change-plan', label: 'Change Plan', icon: <CreditCardOutlined />, path: '/change-plan' },
  ].filter(Boolean);

  const userMenu = (
    <Menu
      items={[
        { key: '1', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/profile') },
        {
          key: '2',
          icon: canAccess('feedback') ? <MdOutlineFeedback /> : <LockOutlined />,
          label: 'Feedback',
          onClick: () => {
            if (!canAccess('feedback')) {
              message.info('Upgrade your plan to send feedback');
              navigate('/upgrade');
            } else {
              navigate('/feedback');
            }
          },
        },
        {
          key: '3',
          icon: <SwapOutlined />,
          label: 'Switch Role',
          onClick: handleChangeRole,
        },
        { key: '4', icon: <CreditCardOutlined />, label: 'Change Plan', onClick: () => navigate('/change-plan') },
        { key: '5', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ]}
    />
  );

  const mainMenuItems = [
    { key: 'home', label: <Link to="/"><HomeOutlined /> Home</Link> },
    { key: 'about', label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link> },
    { key: 'files', label: <Link to="/files"><FileOutlined /> Files</Link> },
    user?.role === 'admin' && { key: 'admin', label: <Link to="/admin"><DashboardOutlined /> Admin Panel</Link> },
  ].filter(Boolean);

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-300" />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" items={mainMenuItems} className="bg-[#1E90FF] google-menu" />
        </div>

        <div className="flex items-center">
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
          <Avatar src={user?.picture} size={32} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold text-white text-[14px]">
              {user?.role === 'premium' || user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'standard' || user?.role === 'free'  ? user?.displayName : 'Account'}
            </div>
            <div className="text-[10px] text-white/80">{user?.email}</div>
          </div>
          <Tooltip title={`Role: ${user?.role}`}>
            <Tag color={getRoleColor(user?.role)}>{user?.role?.toUpperCase()}</Tag>
          </Tooltip>
        </div>

        <Menu
          mode="inline"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Space>
                {item.label}
                {item.feature && !canAccess(item.feature) && <LockOutlined style={{ color: 'red' }} />}
              </Space>
            ),
            onClick: () => {
              if (item.feature && !canAccess(item.feature)) {
                message.info('Upgrade your plan to access this feature');
                navigate('/upgrade');
              } else {
                navigate(item.path);
              }
              setDrawerVisible(false);
            },
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

