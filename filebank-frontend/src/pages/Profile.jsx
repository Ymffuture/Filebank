import React, { useEffect, useState } from 'react';
import {
  Card, Avatar, Descriptions, Skeleton, Upload, Button, message,
  Input, Typography, Space, Spin
} from 'antd';
import {
  UserOutlined, UploadOutlined, EditOutlined, SaveOutlined,
  CloseOutlined, MailOutlined, IdcardOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../api/fileApi';

const { Title, Text } = Typography;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picture: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setForm({
        name: res.data.displayName || res.data.name,
        email: res.data.email,
        picture: res.data.picture,
      });
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
    } catch {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put('/auth/update-profile', {
        name: form.name,
        picture: form.picture
      });
      setUser(res.data.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.data));
      message.success('Profile updated successfully');
      setEditing(false);
    } catch {
      message.error('Update failed');
    }
  };

  const handleUpload = async ({ file }) => {
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/auth/upload-avatar', data);
      setForm({ ...form, picture: res.data.url });
      message.success('Avatar updated');
    } catch {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out'
        }}
        hoverable
      >
        <Space direction="vertical" style={{ width: '100%' }} align="center">
          <div style={{ position: 'relative' }}>
            <Avatar
              size={100}
              src={form.picture}
              icon={<UserOutlined />}
              style={{
                border: '4px solid #f0f0f0',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <Upload
              name="image"
              showUploadList={false}
              customRequest={handleUpload}
              accept="image/*"
              disabled={uploading}
              style={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <Button
                size="small"
                icon={<UploadOutlined />}
                loading={uploading}
                style={{ marginTop: 8 }}
              >
                Change
              </Button>
            </Upload>
          </div>
        </Space>

        <Title level={4} style={{ textAlign: 'center', marginTop: 16 }}>My Profile</Title>

        {editing ? (
          <>
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ marginBottom: 12 }}
            />
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={form.email}
              disabled
              style={{ marginBottom: 12 }}
            />
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleUpdate}>Save</Button>
              <Button icon={<CloseOutlined />} onClick={() => setEditing(false)}>Cancel</Button>
            </Space>
          </>
        ) : (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginTop: 16 }}>
              <Descriptions.Item label="Name">{user.displayName || user.name}</Descriptions.Item>
              <Descriptions.Item label="Email"><MailOutlined /> {user.email}</Descriptions.Item>
              <Descriptions.Item label="Role"><IdcardOutlined /> {user.role?.toUpperCase() || 'USER'}</Descriptions.Item>
            </Descriptions>
            <Button
              icon={<EditOutlined />}
              type="default"
              block
              style={{ marginTop: 16 }}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
            <Link to="/dashboard">
              <Button icon={<ArrowLeftOutlined />} type="link" block style={{ marginTop: 8 }}>
                Back to Dashboard
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

