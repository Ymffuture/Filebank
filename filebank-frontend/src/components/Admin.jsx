import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Avatar,
  Space,
  Input,
  Modal,
  Dropdown,
  Menu,
  Row,
  Col,
  Card,
  Statistic,
  List,
  message
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import {
  ArrowLeftOutlined,
  NotificationOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifText, setNotifText] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
      const res = await api.get('v1/feedback');
      setFeedbacks(res.data.data || res.data);
    } catch {
      enqueueSnackbar('Failed to load feedback', { variant: 'error' });
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

  const handleSendNotification = async () => {
    if (!notifText.trim()) {
      message.warning('Notification text cannot be empty');
      return;
    }
    try {
      await api.post('/admin/notify-all', { message: notifText });
      enqueueSnackbar('Notification sent', { variant: 'success' });
      setNotifModalVisible(false);
      setNotifText('');
    } catch {
      enqueueSnackbar('Failed to send notification', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllFeedback();
  }, []);

  const totalUsers = useMemo(() => users.length, [users]);
  const totalUploads = useMemo(() => users.reduce((sum, u) => sum + u.uploadCount, 0), [users]);
  const averageUploads = useMemo(() => (totalUsers ? totalUploads / totalUsers : 0), [totalUsers, totalUploads]);
  const usersWithUploads = useMemo(() => users.filter(u => u.uploadCount > 0).length, [users]);
  const percentageWithUploads = useMemo(() => (totalUsers ? (usersWithUploads / totalUsers) * 100 : 0), [totalUsers, usersWithUploads]);
  const topUsers = useMemo(() => [...users].sort((a, b) => b.uploadCount - a.uploadCount).slice(0, 5), [users]);

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

  return (
    <div className="p-4" style={{ overflow: 'hidden' }}>
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>Back</Button>
        <Button icon={<NotificationOutlined />} type="primary" onClick={() => setNotifModalVisible(true)}>Notify All</Button>
      </Space>

      <Row gutter={16} className="mb-4">
        <Col span={6}><Statistic title="Total Users" value={totalUsers} /></Col>
        <Col span={6}><Statistic title="Total Uploads" value={totalUploads} /></Col>
        <Col span={6}><Statistic title="Average Uploads" value={averageUploads.toFixed(2)} /></Col>
        <Col span={6}><Statistic title="Users with Uploads" value={`${usersWithUploads} (${percentageWithUploads.toFixed(2)}%)`} /></Col>
      </Row>

      <Card title="Top 5 Users by Uploads" className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topUsers.map(u => ({ name: u.displayName, uploads: u.uploadCount }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uploads" fill="#1E90FF" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ overflowX: 'auto' }}>
        <Table dataSource={users} columns={columns} rowKey="_id" bordered pagination={{ pageSize: 10 }} />
      </div>

      <Card title="All Feedback" className="mb-4">
        <List dataSource={feedbacks} renderItem={f => (
          <List.Item>
            <div><strong>Type:</strong> {f.type}</div>
            <div><strong>Description:</strong> {f.description}</div>
            <div><strong>Rating:</strong> {f.rating}/5</div>
            <div><strong>Submitted:</strong> {new Date(f.createdAt).toLocaleString()}</div>
          </List.Item>
        )} />
      </Card>

      <Modal title="Send Update" open={notifModalVisible} onOk={handleSendNotification} onCancel={() => setNotifModalVisible(false)} okText="Send">
        <Input.TextArea rows={4} value={notifText} onChange={e => setNotifText(e.target.value)} placeholder="Message..." />
      </Modal>
    </div>
  );
}

