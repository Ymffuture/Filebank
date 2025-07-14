import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Avatar, Space, Badge, Button, Drawer, message } from 'antd';
import {
  BellOutlined, DashboardOutlined, FileOutlined, HomeOutlined,
  InfoCircleOutlined, MenuOutlined, UserOutlined, GoogleOutlined, LogoutOutlined
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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleLoginSuccess = async (resp) => {
    try {
      const res = await api.post('/auth/google-login', { credential: resp.credential });
      setUser(res.data.user);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.user));
      localStorage.setItem('filebankToken', res.data.token);
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

  const mainMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
    { key: 'about', icon: <InfoCircleOutlined />, label: <Link to="/about-us">About Us</Link> },
    { key: 'files', icon: <FileOutlined />, label: <Link to="/files">My Files</Link> },
    user?.role === 'admin' && { key: 'admin', icon: <DashboardOutlined />, label: <Link to="/admin">Admin Panel</Link> },
  ].filter(Boolean);

  return (
    <>
      <Header className="flex justify-between items-center bg-white shadow px-4 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="FileBank Logo" className="w-10 h-10" />
          <span className="font-bold text-xl text-[#0B3D91] hidden md:inline">FileBank</span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menu mode="horizontal" theme="light" items={mainMenuItems} className="bg-transparent border-none text-[#0B3D91] font-medium" />
        </div>

        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="md:hidden text-2xl"
        />
      </Header>

      <Drawer
        placement="left"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        bodyStyle={{ padding: 0 }}
        width={270}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full bg-[#0B3D91] text-white">
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-4 border-b border-white/20 bg-gradient-to-r from-[#0B3D91] via-[#154AA5] to-[#1E5BB5]">
            <Avatar src={user?.picture} size={64} icon={!user?.picture && <UserOutlined />} />
            <div>
              <div className="font-bold text-lg">{user?.displayName || 'Guest'}</div>
              <div className="text-sm opacity-80">{user?.email || 'Not Logged In'}</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[]}
            items={mainMenuItems.map(item => ({
              ...item,
              onClick: () => setDrawerVisible(false),
              style: { fontWeight: 600, fontSize: '1.05rem', color: 'white' }
            }))}
            className="flex-grow bg-transparent"
          />

          {/* Footer Actions */}
          <div className="p-4 space-y-3 bg-[#0B3D91] border-t border-white/20">
            <Button
              block
              icon={<BellOutlined />}
              onClick={() => {
                setNotifModalVisible(true);
                setDrawerVisible(false);
              }}
              className="flex items-center justify-between bg-[#154AA5] text-white hover:bg-[#1E5BB5] rounded-lg"
            >
              Notifications
              <Badge count={notifications} size="small" style={{ backgroundColor: '#FFD700' }} />
            </Button>

            <Button
              block
              icon={<MdOutlineFeedback />}
              onClick={() => {
                navigate('/feedback');
                setDrawerVisible(false);
              }}
              className="flex items-center justify-center bg-[#154AA5] text-white hover:bg-[#1E5BB5] rounded-lg"
            >
              Feedback
            </Button>

            {user ? (
              <Button
                block
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
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
        </div>
      </Drawer>

      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </>
  );
}

