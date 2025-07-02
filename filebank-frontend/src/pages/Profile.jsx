// components/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Card, Avatar, Descriptions, Spin, message, Input, Button } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { Link } from 'react-router-dom';
import { ArrowBigLeftDashIcon } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('filebankUser')));
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picture: '' });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setForm({
        name: res.data.displayName || res.data.name,
        email: res.data.email,
        picture: res.data.picture,
      });
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/auth/update-profile', form);
      setUser(res.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
      message.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to update profile');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Button type="link" className="mt-4">
        <ArrowBigLeftDashIcon />
        <Link to="/dashboard">Back</Link>
      </Button>

      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <Card title="Profile" style={{ maxWidth: 500, width: '100%' }} bordered>
          <div className="flex justify-center mb-4">
            <Avatar size={100} src={form.picture} icon={<UserOutlined />} />
          </div>

          {editing ? (
            <>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mb-2"
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mb-2"
              />
              <Input
                placeholder="Profile picture URL"
                value={form.picture}
                onChange={(e) => setForm({ ...form, picture: e.target.value })}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button type="primary" onClick={handleUpdateProfile}>
                  Save Changes
                </Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
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
              <Button type="primary" ghost block className="mt-4" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

