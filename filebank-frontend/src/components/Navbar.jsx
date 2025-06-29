import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, message } from 'antd';
import { BellOutlined, DashboardOutlined, DownOutlined, FileOutlined } from '@ant-design/icons';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../api/fileApi';
import logo from '/vite.svg';

const { Header } = Layout;

export default function Navbar() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications'); // Your backend should provide this or mock
      setNotifications(res.data.count || 0);
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUser = {
        googleId: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };

      const res = await api.post('/auth/google-login', googleUser);
      const userData = res.data.user;
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('filebankUser', JSON.stringify(userData));
      localStorage.setItem('filebankToken', token);

      message.success('Login successful!');
      fetchNotifications();
    } catch (err) {
      console.error(err);
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
        { key: '2', label: <a href="/profile">Profile</a> },
      ]}
    />
  );

  const mainMenuItems = [
    { key: 'dashboard', label: <a href="/dashboard"><DashboardOutlined/> Dashboard</a> },
    { key: 'files', label: <a href="/files"><FileOutlined/> Files</a> },
    user?.role === 'admin' && { key: 'admin', label: <a href="/admin">Admin Panel</a> }
  ].filter(Boolean);

  return (
    <Header className="sticky top-2 z-50 bg-[#adc6df] px-4 flex flex-wrap justify-between items-center shadow rounded">
      <Space>
        
        <img src={logo} alt="FileBank Logo" className="w-35 h-8" />
        <span className='text-white'>Powered by Qurovex</span>
        <Menu
          mode="horizontal"
          theme="dark"
          items={mainMenuItems}
          className="bg-transparent text-white"
        />
      </Space>

      <Space>
        {user ? (
          <>
            <Badge count={notifications} offset={[0, 5]}>
              <BellOutlined className="text-white text-lg cursor-pointer" onClick={fetchNotifications} />
            </Badge>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space className="cursor-pointer text-white">
                <Avatar src={user.picture} />
                <span>{user.role?.toUpperCase()}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => message.error('Login failed.')}
          />
        )}
      </Space>
    </Header>
  );
}
