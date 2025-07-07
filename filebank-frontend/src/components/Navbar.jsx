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

  // play beep on new
  const playSound = () => { /* same as before */ };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      const newCount = res.data.count || 0;
      if (newCount > notifications) playSound();
      setNotifications(newCount);
    } catch { /* ... */ }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 5000);
    return () => clearInterval(iv);
  }, [user, fetchNotifications]);

  const handleLoginSuccess = async (credRes) => { /* same */ };
  const handleLogout = () => { /* same */ };

  const userMenu = (
    <Menu items={[
      { key: '1', icon: <UserOutlined />,  label: 'Profile', onClick: () => navigate('/profile') },
      { key: '2', icon: <LogoutOutlined />, label: 'Logout',  onClick: handleLogout }
    ]}/>
  );

  const mainMenuItems = [
    { key: 'home',  label: <Link to="/"><HomeOutlined /> Home</Link> },
    { key: 'about', label: <Link to="/about-us"><InfoCircleOutlined /> About Us</Link> },
    { key: 'files', label: <Link to="/files"><FileOutlined /> Files</Link> },
    user?.role === 'admin' && { key: 'admin', label: <Link to="/admin"><DashboardOutlined /> Admin</Link> }
  ].filter(Boolean);

  const profilePic = user?.picture;

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow sticky top-0 z-50 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="FileBank" className="w-12 h-12 md:w-16 md:h-16" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" theme="light" items={mainMenuItems} className="bg-transparent" />
        </div>

        {/* Right icons on desktop only */}
        <Space size="large" className="items-center">
          {user ? (
            <>
              {/* Notifications */}
              <Badge
                count={notifications}
                offset={[0, 5]}
                style={{ backgroundColor: '#333' }}
                className="cursor-pointer md:hidden hidden "
              >
                <BellOutlined
                  className="text-2xl"
                  onClick={() => setNotifModalVisible(true)}
                />
              </Badge>
              {/* Profile */}
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
                <span className="absolute top-[5px] right-[5px] block w-2 h-2 bg-red-500 rounded-full" />
              )}
            </>
          }
        />
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4 border-b">
          <Space>
            {profilePic
              ? <Avatar src={profilePic} size="large" />
              : <Avatar size="large" icon={<UserOutlined />} />}
            <div>
              <div className="font-semibold">{user?.displayName || 'Guest'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </Space>
        </div>
        <Menu
          mode="inline"
          items={mainMenuItems.map(i => ({ ...i, onClick: () => setDrawerVisible(false) }))}
        />
        <div className="mt-auto p-4 border-t">
          <Space direction="vertical" size="large" className="w-full">
            <Button block icon={<BellOutlined />} onClick={() => { setNotifModalVisible(true); setDrawerVisible(false); }}>
              Notifications
              <Badge
                count={notifications}
                offset={[0, 5]}
                style={{ backgroundColor: '#333' }}
                className="cursor-pointer"
              >
        
              </Badge>
            </Button>
            {user ? (
              <Button block icon={<LogoutOutlined />} danger onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <GoogleLogin onSuccess={handleLoginSuccess} onError={()=>{}} />
            )}
            <Button block type="default" onClick={() => navigate('/feedback')}>
              Feedback
            </Button>
          </Space>
        </div>
      </Drawer>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />

      {/* Floating feedback button on large screens 
      <Button
        type="primary"
        shape="circle"
        size="large"
        className="md:hidden lg:flex fixed bottom-6 right-6 items-center justify-center shadow-xl"
        icon={<MdOutlineFeedback size={24} />}
        onClick={() => navigate('/feedback')}
      />
      */} 
    </>
  );
}
 
