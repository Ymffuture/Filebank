import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Popconfirm, Avatar, Space, Row, Col, Card,
  Statistic, List, Tag, Rate, Typography, Divider, Empty, Dropdown, Menu, Modal, message
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeftOutlined, NotificationOutlined, EllipsisOutlined, MessageOutlined, StarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';
import LexicalNotificationEditor from './LexicalNotificationEditor';

const { Text } = Typography;
const { SubMenu } = Menu;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [uploadCounts, setUploadCounts] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

const handleChangeRole = async (id, newRole) => {
  try {
    await api.put(`/admin/users/${id}/role`, { role: newRole });
    enqueueSnackbar(`Role changed to ${newRole}`, { variant: 'success' });
    fetchUsers(); // refresh updated list
  } catch (error) {
    console.error('Role update error:', error);
    enqueueSnackbar('Failed to change role', { variant: 'error' });
  }
};


  
  useEffect(() => {
    fetchUsers();
    fetchAllFeedback();
    fetchUploadCounts();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || res.data);
    } catch {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    }
  };

  const fetchAllFeedback = async () => {
    try {
      const res = await api.get('/v1/feedback');
      setFeedbacks(res.data.data || res.data);
    } catch {
      enqueueSnackbar('Failed to load feedback', { variant: 'error' });
    }
  };

  const fetchUploadCounts = async () => {
    try {
      const res = await api.get('/files/upload/count/all');
      setUploadCounts(res.data.data || []);
    } catch {
      enqueueSnackbar('Failed to load upload counts', { variant: 'error' });
    }
  };

  const mergedUsers = useMemo(() => {
    return users.map(user => {
      const countObj = uploadCounts.find(c => c._id === user._id) || { uploadCount: 0 };
      return { ...user, uploadCount: countObj.uploadCount };
    });
  }, [users, uploadCounts]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
      fetchUploadCounts();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      const action = isBlocked ? 'unblock' : 'block';
      await api.post(`/admin/users/${id}/${action}`);
      enqueueSnackbar(`User ${isBlocked ? 'unblocked' : 'blocked'}`, { variant: 'success' });
      fetchUsers();
    } catch {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleIssue = async (id, isIssue) => {
    try {
      const action = isIssue ? 'remove-issue' : 'mark-as-issue';
      await api.post(`/admin/users/${id}/${action}`);
      enqueueSnackbar(isIssue ? 'Issue removed' : 'Marked as issue', { variant: 'success' });
      fetchUsers();
    } catch {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const columns = [
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: pic => <Avatar src={pic} />
    },
    { title: 'Name', dataIndex: 'displayName', key: 'displayName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Uploads', dataIndex: 'uploadCount', key: 'uploadCount' },
        {
  title: 'Role',
  dataIndex: 'role',
  key: 'role',
  render: role => (
    <Tag color={
      role === 'admin' ? 'gold' :
      role === 'moderator' ? 'purple' :
      role === 'premium' ? 'cyan' :
      role === 'standard' ? 'blue' :
      'gray'
    }>
      {role.replace(/_/g, ' ').toUpperCase()}
    </Tag>
  )
}, 
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
    const menu = (
  <Menu>
    <Menu.Item key="delete">
      <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
        Delete
      </Popconfirm>
    </Menu.Item>
    <Menu.Item key="block" onClick={() => handleBlock(record._id, record.isBlocked)}>
      {record.isBlocked ? 'Unblock' : 'Block'}
    </Menu.Item>
    <Menu.Item key="issue" onClick={() => handleIssue(record._id, record.isIssue)}>
      {record.isIssue ? 'Remove Issue' : 'Mark as Issue'}
    </Menu.Item>
    <Menu.SubMenu key="changeRole" title="Change Role">
  <Menu.SubMenu key="role" title="Change Role">
  {['admin', 'moderator', 'premium', 'standard', 'free'].map(role => (
    <Menu.Item key={role} onClick={() => handleChangeRole(record._id, role)}>
      Make {role.replace(/_/g, ' ').toUpperCase()}
    </Menu.Item>
  ))}
</Menu.SubMenu>
  </Menu>
);
        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      }
    }

  ];

  const totalUsers = mergedUsers.length;
  const totalUploads = mergedUsers.reduce((sum, u) => sum + u.uploadCount, 0);
  const averageUploads = totalUsers ? (totalUploads / totalUsers).toFixed(2) : 0;
  const usersWithUploads = mergedUsers.filter(u => u.uploadCount > 0).length;
  const percentageWithUploads = totalUsers ? ((usersWithUploads / totalUsers) * 100).toFixed(2) : 0;
  const topUsers = [...mergedUsers].sort((a, b) => b.uploadCount - a.uploadCount).slice(0, 5);

  return (
    <div className="p-4" style={{ overflow: 'hidden' }}>
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>Back</Button>
        <Button icon={<NotificationOutlined />} type="primary" onClick={() => setNotifModalVisible(true)}>Notify All</Button>
      </Space>

      <Row gutter={16} className="mb-4">
        <Col span={6}><Statistic title="Total Users" value={totalUsers} /></Col>
        <Col span={6}><Statistic title="Total Uploads" value={totalUploads} /></Col>
        <Col span={6}><Statistic title="Average Uploads" value={averageUploads} /></Col>
        <Col span={6}><Statistic title="Users with Uploads" value={`${usersWithUploads} (${percentageWithUploads}%)`} /></Col>
      </Row>

      <Card title="Top 5 Users by Uploads" className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topUsers.map(u => ({ name: u.displayName, uploads: u.uploadCount }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uploads" fill="#1E90FF" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Table
  dataSource={mergedUsers}
  columns={columns}
  rowKey="_id"
  bordered
  pagination={{ pageSize: 10 }}
  scroll={{ x: 'max-content' }}
/>

      <Card
        title={<div className="flex items-center gap-2 text-lg font-semibold"><MessageOutlined /> All Feedback</div>}
        className="mt-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700"
        bodyStyle={{ padding: 0 }}
      >
        {feedbacks.length === 0 ? (
          <Empty description="No feedback yet" className="my-8" />
        ) : (
          <List
            dataSource={feedbacks}
            renderItem={(f, idx) => (
              <>
                <List.Item className="flex flex-col md:flex-row md:items-center md:justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={f.type === 'complaint' ? 'red' : f.type === 'improvement' ? 'blue' : 'green'}>
                        {f.type}
                      </Tag>
                      <Text code className="text-sm text-gray-500 dark:text-gray-400">
                        <ClockCircleOutlined className="mr-1" />
                        {new Date(f.createdAt).toLocaleString()}
                      </Text>
                    </div>
                    <Text className="block text-base text-gray-800 dark:text-white mb-1 leading-relaxed">
                      {f.description}
                    </Text>
                    <div className="flex items-center gap-2 mt-2">
                      <StarOutlined className="text-yellow-500" />
                      <Rate allowHalf disabled defaultValue={f.rating} style={{ fontSize: 14 }} />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">({f.rating}/5)</Text>
                    </div>
                  </div>
                </List.Item>
                {idx < feedbacks.length - 1 && <Divider style={{ margin: 0 }} />}
              </>
            )}
          />
        )}
      </Card>

      <Modal
        title="Send Notification"
        open={notifModalVisible}
        onCancel={() => setNotifModalVisible(false)}
        footer={null}
        width={600}
      >
        <LexicalNotificationEditor
          onSend={(htmlContent) => {
            api.post('/admin/notify-all', { message: htmlContent })
              .then(() => {
                enqueueSnackbar('Notification sent', { variant: 'success' });
                setNotifModalVisible(false);
              })
              .catch(() => {
                enqueueSnackbar('Failed to send notification', { variant: 'error' });
              });
          }}
        />
      </Modal>
    </div>
  );
}

