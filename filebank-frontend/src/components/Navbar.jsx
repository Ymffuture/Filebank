import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Alert, Drawer, message, Tag, Tooltip,
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

// replace

import { motion } from "framer-motion";

import {
  LayoutDashboard,
  File,
  Home,
  Info,
  Menu as LucideMenu,
  User,
  LogOut,
  Bot,
  LifeBuoy, 
  FileText,
  Headphones,
  CreditCard,
  Lock,
  MessageSquare, 
} from 'lucide-react';


// end


import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineFeedback } from 'react-icons/md';
import api from '../api/fileApi';
import NotificationsModal from './NotificationsModal';
import logo from '/Loogo.png';
import { useSnackbar } from 'notistack';
import { FaLock } from 'react-icons/fa';
import { ShieldCheck, CheckCircle, Bell, Crown, BadgeCheck} from 'lucide-react';
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
  { key: 'home', label: 'Home', icon: <Home size={18} />, path: '/' },
  { key: 'about', label: 'About Us', icon: <Info size={18} />, path: '/about-us' },
  { key: 'files', label: 'Files', icon: <File size={18} />, path: '/files' },
  user?.role === 'admin' && { key: 'admin', label: 'Admin Panel', icon: <LayoutDashboard size={18} />, path: '/admin' },
  { key: 'ai', label: 'AI assistant', icon: <Bot size={18} />, path: '/full-screen-ai', feature: 'ai' },
  { key: 'cv-tips', label: 'Build CV & coverletter', icon: <FileText size={18} />, path: '/cv', feature: 'cv-tips' },
  { key: 'agent', label: 'Agent', icon: <Headphones size={18} />, path: '/agent', feature: 'agent' },
  { key: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} />, path: '/feedback', feature: 'feedback' },
  { key: 'change-plan', label: 'Change Plan', icon: <CreditCard size={18} />, path: '/change-plan' },

  // NEW ITEM: Only show if user has an issue
  user?.hasIssue && { key: 'issues', label: 'My Issues', icon: <ShieldCheck size={18} color="orange" />, path: '/issues' },
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

  const isPremium = ['premium', 'admin'].includes(user?.role);
  
  return (
    <>
      <Header className="flex justify-between sticky top-0 z-50 px-4 dark:bg-black">
  {/* Menu icon on far left */}
  <div className="flex items-center">
    <Button
      type="text"
      className="md:hidden text-[26px] relative text-white left-[-25%]"
      onClick={() => setDrawerVisible(true)}
      icon={
        <>
          <MenuOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#fff' }} />
          {notifications > 0 && (
            <span className="absolute top-0 right-1 block w-3 h-3 bg-[#FFF00] rounded-full" />
          )}
        </>
      }
    />
    <Link to="/" className="flex items-center relative right-[25%] font-inter">
    {/* <img src={logo} alt="Famacloud Logo" className="w-16 h-16 md:w-16 md:h-16 scale-60" />*/} 
  <span className="text-lg flex">
  <span className="text-[whitesmoke] font-bold ">Fama</span>
  <span className="text-[#fff] ">cloud</span>
</span>

</Link>
{user?.hasIssue && (
      <Tooltip title="This account has an issue" color="orange">
        <Badge
          count={<Info size={18} color="black" />}
          style={{
            backgroundColor: 'yellow',
            borderRadius:'50%', 
            boxShadow: '0 0 4px rgba(0,0,0,0.3)',
          }}
          offset={[-30, - 8]}
          className='animate-pulse transition-all' 
        />
      </Tooltip>
    )}


    
    {/* Center menu (desktop only) */}
  <div className="hidden md:flex flex-1 justify-center">
    <Menu mode="horizontal" items={mainMenuItems} className="bg-[#1E90FF] google-menu" />
  </div>

  {/* Avatar and user dropdown on the right */}
  <div className="absolute right-5 top-3 flex items-center space-x-4 gap-3">
  {/* Notification Icon with Badge */}
  <Badge
  count={notifications > 0 ? (
    <span
      style={{
        backgroundColor: '#FF0000',  // custom background color
        color: '#fff',               // text color
        border: '4px solid #1E90FF',   // border color
        padding: '4px',
        borderRadius: '50px',
        fontSize: '12px',
        boxShadow: '0 0 4px #1E90FF'
      }}
    >
      {notifications}
    </span>) : null }
  size="medium"
  offset={[-4, 3]}
>
  <Bell
    className="text-white text-[20px] cursor-pointer hover:text-blue-400 transition"
    onClick={() => {
      setNotifModalVisible(true);
      setDrawerVisible(false);
    }}
  />
</Badge>


  {/* Avatar with Dropdown */}
  <Dropdown overlay={userMenu} placement="bottomRight" arrow>
    <Avatar
      src={user?.picture}
      icon={<UserOutlined />}
      className="cursor-pointer hover:shadow-lg transition"
      size="default"
    />
  </Dropdown>
</div>

    
  </div>

  

</Header>


      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', background: '#0B3D91' }}
      >
        


<div className="p-2 flex items-center gap-4">

  {user?.isBlocked && (<motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-6"
    >
      <Alert
        message={
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <LifeBuoy size={22} className="text-red-500" />
            <span className="text-[15px] font-medium">
              Your account has been blocked. Please contact support for assistance.
            </span>
          </div>
        }
        type="error"
        showIcon={false}
        className="rounded-xl shadow-lg border border-red-300 bg-red-50 p-4"
        action={
          <Button
            type="primary"
            danger
            onClick={onContactSupport}
            className="rounded-lg px-5 font-semibold"
          >
            Contact Support
          </Button>
        }
      />
    </motion.div>)} 
  

  
  <Avatar src={user?.picture} size={32} icon={<UserOutlined />} />

  <div className="flex-1">
    <div className="flex items-center gap-1 text-white text-[14px] font-semibold">
      {user?.displayName || 'Account'}
      {isPremium && <Crown className="text-yellow-400 w-4 h-4" />}
    </div>
    <div className="text-[10px] text-white/80">{user?.email}</div>
  </div>

  {!isPremium ? (
    <Tooltip
      title={
        <div className="text-center">
          <div className="mb-1">You're on <strong>{user?.role}</strong> plan</div>
          <Button type="dashed" size="small" onClick={() => navigate('/change-plan')}>
            Upgrade
          </Button>
        </div>
      }
      color="black"
    >
      <Tag color={getRoleColor(user?.role)} className="cursor-pointer">
        {user?.role?.toUpperCase()}
      </Tag>
    </Tooltip>
  ) : (
    <Tooltip title={`You're on ${user?.role} plan`} color="gold">
      <Tag color={getRoleColor(user?.role)}>{user?.role?.toUpperCase()}</Tag>
    </Tooltip>
  )}
</div>


        <Menu
          mode="inline"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Space>
                {item.label}
                {item.feature && !canAccess(item.feature) && <FaLock style={{ color: '#666' }} />}
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

        <div className="p-1 space-y-2 text-white">
          <Button
            block
            type="link"
            icon={<BellOutlined style={{ color: '#1E90FF' }} />}
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

          {!user ? (
  user?.isBlocked ? (
    <Tooltip title="Your account is blocked. Please contact support." color="red">
      <Button block disabled icon={<Lock />}>
        Login Disabled
      </Button>
    </Tooltip>
  ) : (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={() => message.error('Login failed.')}
      shape="pill"
      theme="filled_blue"
      text="signin_with"
      useOneTap
    />
  )
) : (
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
    
  >
    <span
      onClick={() => {
    setNotifModalVisible(true);
    setDrawerVisible(false);
      }}
      >🔔 You have a new notification <span className='text-[8px] text-black'>Tap to view</span></span>
    <Button size="small" onClick={() => setNewNotif(false)} type='link'>
      Dismiss
    </Button>
  </div>
)}
      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </>
  );
}
