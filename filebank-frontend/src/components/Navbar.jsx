import React, { useState, useEffect,useCallback } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer } from 'antd';
import { BellOutlined, DashboardOutlined, FileOutlined, HomeOutlined, InfoCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
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
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchNotifications(); // initial fetch

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // refresh every 5s

    return () => clearInterval(interval); // cleanup on unmount
  }, [user, fetchNotifications]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      const res = await api.post('/auth/google-login', { credential });
      const userData = res.data.user;
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('filebankUser', JSON.stringify(userData));
      localStorage.setItem('filebankToken', token);

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
        { key: '1', label: <span onClick={handleLogout}>Logout</span> },
        { key: '2', label: <Link to="/profile">Profile</Link> },
      ]}
    />
  );

  const mainMenuItems = [
    {
      key: 'home',
      label: <Link to="/"><HomeOutlined /> Home</Link>
    },
    {
      key: 'about',
      label: <Link to="/about"><InfoCircleOutlined /> About Us</Link>
    },
    {
      key: 'files',
      label: <Link to="/files"><FileOutlined /> Files</Link>
    },
    user?.role === 'admin' && {
      key: 'admin',
      label: <Link to="/admin">Admin Panel</Link>
    }
  ].filter(Boolean);

  const profilePic = user?.picture;
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'FB';

  return (
    <Header className="bg-[#adc6df] px-4 flex justify-between items-center shadow rounded sticky top-0 z-50">
      <Space>
        <img src={logo} alt="FileBank Logo" className="w-8 h-8" />
        <span className="hidden md:block text-white">Powered by Qurovex</span>
      </Space>

      <div className="hidden md:flex">
        <Menu mode="horizontal" theme="dark" items={mainMenuItems} className="bg-transparent text-white" />
      </div>

      <Space className="md:flex hidden">
        {user && (
          <>
            
<Badge count={notifications} offset={[0, 5]}>
  <BellOutlined
    className="text-white text-[28px] cursor-pointer select-none"
    onClick={() => setNotifModalVisible(true)}
  />
</Badge>

<NotificationsModal
  visible={notifModalVisible}
  onClose={() => setNotifModalVisible(false)}
/>
          </>
        )}
        {!user && (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => message.error('Login failed.')}
          />
        )}
      </Space>

      {/* Mobile: hamburger */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        className="md:hidden text-white"
        onClick={() => setDrawerVisible(true)}
      />

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="vertical"
          items={mainMenuItems}
          onClick={() => setDrawerVisible(false)}
        />
        <div className="mt-4">
          {user ? (
            <>
              <Badge count={notifications} offset={[0, 5]}>
                <BellOutlined className="text-lg cursor-pointer" onClick={fetchNotifications} />
              </Badge>
              <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                <Space className="cursor-pointer mt-2">
                  {profilePic
                    ? <Avatar src={profilePic} size="large" />
                    : <Avatar size="large" style={{ backgroundColor: '#1890ff', color: '#fff' }}>{initials}</Avatar>}
                  <span>{user.role?.toUpperCase()}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => message.error('Login failed.')}
            />
          )}
        </div>
      </Drawer>
    </Header>
  );
}

