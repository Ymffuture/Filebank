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
  const [newPic, setNewPic] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePicture = async () => {
    try {
      const res = await api.put('/auth/update-picture', { picture: newPic });
      setUser(res.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
      message.success('Profile picture updated!');
      setEditing(false);
      setNewPic('');
    } catch (err) {
      console.error(err);
      message.error('Failed to update picture');
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
 <Button type="link" className='mt-26'>
  <ArrowBigLeftDashIcon/>
              <Link to='/dashboard'>
              Back
              </Link>
                </Button>

    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <Card title="Profile" style={{ maxWidth: 500, width: '100%' }} bordered>
        <div className="flex justify-center mb-4">
          <Avatar size={100} src={user?.picture} icon={<UserOutlined />} />
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

        <div className="mt-4">
          {editing ? (
            <>
              <Input
                placeholder="Enter new profile picture URL"
                value={newPic}
                onChange={(e) => setNewPic(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button type="primary" onClick={handleUpdatePicture}>
                  Save
                </Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <Button type="dashed" onClick={() => setEditing(true)}>
              Edit Profile Picture
            </Button>
          )}
        </div>
      </Card>
    </div>
    </>
  );
}
