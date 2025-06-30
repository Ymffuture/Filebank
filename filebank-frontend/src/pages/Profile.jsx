import React, { useEffect, useState } from 'react';
import { Card, Avatar, Descriptions, Spin, message } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      // Optionally, fetch from API if you want to verify fresh info
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me'); // Assuming you have a /me route or similar
      setUser(res.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <Card
        title="Profile"
        style={{ maxWidth: 500, width: '100%' }}
        bordered
      >
        <div className="flex justify-center mb-4">
          <Avatar size={100} src={user.picture} icon={<UserOutlined />} />
        </div>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Name">
            {user.displayName || user.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <MailOutlined /> {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <IdcardOutlined /> {user.role ? user.role.toUpperCase() : 'USER'}
          </Descriptions.Item>
          <Descriptions.Item label="Google ID">
            {user.googleId}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
    </>
    
  );
}
