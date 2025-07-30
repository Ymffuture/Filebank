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
import logo from '/logoww.png';
import { useSnackbar } from 'notistack';
import { FaLock } from 'react-icons/fa';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [newNotif, setNewNotif] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
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
      if (newCount > notifications){
        playSound();
        setNewNotif(true);
       } 
      if(newCount ===0){
       setNewNotif(false);
      }
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

  const canAccess = (feature) => {
  const role = user?.role;
  if (!role) return false;

  switch (feature) {
    case 'feedback':
      return role !== 'free';
    case 'ai':
      return ['premium', 'admin'].includes(role);
    case 'cv-tips':
    case 'coverletter-tips':
      return ['standard', 'premium', 'admin'].includes(role);
    case 'agent':
      return ['premium', 'admin'].includes(role); // updated line
    default:
      return true;
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
    { key: 'cv-tips', label: 'Build CV & coverletter', icon: <FileTextOutlined />, path: '/cv', feature: 'cv-tips' },
  //  { key: 'coverletter-tips', label: 'Cover Letter Tips', icon: <FileTextOutlined />, path: '/coverletter-tips', feature: 'cv-tips' },
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
              navigate('/change-plan');
            } else {
              navigate('/feedback');
            }
          },
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
      <Header className="flex justify-between sticky top-0 z-50 px-4">
  {/* Menu icon on far left */}
  <div className="flex items-center gap-0">
    <Button
      type="text"
      className="md:hidden text-[26px] relative text-white left-[-25%]"
      onClick={() => setDrawerVisible(true)}
      icon={
        <>
          <MenuOutlined className="text-blue-600" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 block w-2 h-2 bg-[pink] rounded-full" />
          )}
        </>
      }
    />
    <Link to="/" className="flex items-center">
      <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-80" />
      <span className='text-white' >Famacloud</span >
    </Link>
  </div>

  {/* Center menu (desktop only) */}
  <div className="hidden md:flex flex-1 justify-center">
    <Menu mode="horizontal" items={mainMenuItems} className="bg-[#1E90FF] google-menu" />
  </div>

  {/* Avatar and user dropdown on the right */}
  <div className="flex items-center">
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
          <Tooltip title={`You are currently on ${user?.role} plan`}>
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
                {item.feature && !canAccess(item.feature) && <FaLock style={{ color: 'red' }} />}
              </Space>
            ),
            onClick: () => {
              if (item.feature && !canAccess(item.feature)) {
                enqueueSnackbar('Upgrade your plan to access this feature');
                navigate('/change-plan');
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
      
{newNotif && (
  <div
    className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 text-center font-medium animate-fade-in sticky top-[64px] z-50"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    }}
    onClick={() => {
    setNotifModalVisible(true);
    setDrawerVisible(false);
      }}
  >
    <span>🔔 You have a new notification. <span className='text-[8px] text-black'>Tap to view</span></span>
    <Button size="small" onClick={() => setNewNotif(false)}>
      Dismiss
    </Button>
  </div>
)}
      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </>
  );
}

