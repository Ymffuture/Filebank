import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Avatar, Space, Input, Modal } from 'antd';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import { ArrowLeftOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifText, setNotifText] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  const handleSendNotification = async () => {
    if (!notifText.trim()) {
      message.warning('Notification text cannot be empty');
      return;
    }

    try {
      await api.post('/admin/notify-all', { message: notifText });
      enqueueSnackbar('Notification sent to all users', { variant: 'success' });
      setNotifText('');
      setNotifModalVisible(false);
    } catch {
      enqueueSnackbar('Failed to send notification', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: (pic) => (
        <Avatar src={pic} alt="Profile" />
      ),
    },
    { 
      title: 'Name', 
      dataIndex: 'displayName', 
      key: 'displayName' 
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email' 
    },
    { 
      title: 'Uploads', 
      dataIndex: 'uploadCount', 
      key: 'uploadCount' 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete user?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space className="mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>

        <Button
          icon={<NotificationOutlined />}
          type="primary"
          onClick={() => setNotifModalVisible(true)}
        >
          Send Update to All Users
        </Button>
      </Space>

      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Send Update Notification"
        open={notifModalVisible}
        onOk={handleSendNotification}
        onCancel={() => setNotifModalVisible(false)}
        okText="Send"
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Enter your update message here"
          value={notifText}
          onChange={(e) => setNotifText(e.target.value)}
        />
      </Modal>
    </div>
  );
}

