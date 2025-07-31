import React, { useEffect, useState } from 'react';
import {
  Card, Avatar, Descriptions, Spin, Upload, Button,
  Input, Typography, Space
} from 'antd';
import {
  UserOutlined, UploadOutlined, EditOutlined, SaveOutlined,
  CloseOutlined, MailOutlined, IdcardOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

const { Title } = Typography;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picture: null });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

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
      enqueueSnackbar('Failed to load profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (file) formData.append('image', file);

      setUploading(true);

      const res = await api.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(res.data.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.data));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      setEditing(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
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
    <div className="flex justify-center items-center min-h-[80vh] p-4 bg-[#fafafa]">
      <Card
        style={{
          maxWidth: 460,
          width: '100%',
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          background: '#fff',
          padding: 24
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
                border: '4px solid #eee',
                transition: 'transform 0.3s',
                cursor: editing ? 'pointer' : 'default'
              }}
            />
            {editing && (
              <Upload
                showUploadList={false}
                accept="image/*"
                beforeUpload={(file) => {
                  setFile(file);
                  setForm({ ...form, picture: URL.createObjectURL(file) });
                  return false;
                }}
              >
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    backgroundColor: '#fafafa',
                    border: '1px solid #ccc'
                  }}
                >
                  Change
                </Button>
              </Upload>
            )}
          </div>
        </Space>

        <Title level={4} className="text-center mt-4 font-inter">My Profile</Title>

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
              <Button icon={<SaveOutlined />} type="primary" onClick={handleUpdate} loading={uploading}>
                Save
              </Button>
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

