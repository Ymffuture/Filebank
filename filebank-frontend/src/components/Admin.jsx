import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, message, Popconfirm, Avatar, Space, Input, Modal, Dropdown, Menu, Row, Col, Card, Statistic, List } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import { ArrowLeftOutlined, NotificationOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // New state for all feedback
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifText, setNotifText] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    }
  };

  // Fetch all feedback
  const fetchAllFeedback = async () => {
    try {
      const res = await api.get('/api/v0/c/feedback');
      setFeedbacks(res.data);
    } catch {
      enqueueSnackbar('Failed to load feedback', { variant: 'error' });
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  // Handle blocking/unblocking a user
  const handleBlock = async (id, isBlocked) => {
    try {
      if (isBlocked) {
        await api.post(`/admin/users/${id}/unblock`);
        enqueueSnackbar('User unblocked', { variant: 'success' });
      } else {
        await api.post(`/admin/users/${id}/block`);
        enqueueSnackbar('User blocked', { variant: 'success' });
      }
      fetchUsers();
    } catch {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  // Handle marking/unmarking a user as an issue
  const handleIssue = async (id, isIssue) => {
    try {
      if (isIssue) {
        await api.post(`/admin/users/${id}/remove-issue`);
        enqueueSnackbar('Issue removed', { variant: 'success' });
      } else {
        await api.post(`/admin/users/${id}/mark-as-issue`);
        enqueueSnackbar('Marked as issue', { variant: 'success' });
      }
      fetchUsers();
    } catch {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  // Send notification to all users
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
    fetchAllFeedback(); // Fetch feedback on mount
  }, []);

  // Compute statistics using useMemo for performance
  const totalUsers = useMemo(() => users.length, [users]);
  const totalUploads = useMemo(() => users.reduce((sum, user) => sum + user.uploadCount, 0), [users]);
  const averageUploads = useMemo(() => (totalUsers > 0 ? totalUploads / totalUsers : 0), [totalUsers, totalUploads]);
  const usersWithUploads = useMemo(() => users.filter(user => user.uploadCount > 0).length, [users]);
  const percentageWithUploads = useMemo(() => (totalUsers > 0 ? (usersWithUploads / totalUsers) * 100 : 0), [totalUsers, usersWithUploads]);

  // Prepare data for the chart (top 5 users by uploads)
  const topUsers = useMemo(() => {
    return [...users].sort((a, b) => b.uploadCount - a.uploadCount).slice(0, 5);
  }, [users]);

  // Define table columns (removed Feedback column)
  const columns = [
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: (pic) => <Avatar src={pic} alt="Profile" />,
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
              <Popconfirm
                title="Delete user?"
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
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
            <Button icon={<EllipsisOutlined />}>Actions</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-4" style={{ overflow: 'hidden' }}>
      {/* Navigation and Notification Buttons */}
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
       .cookies
        <Button icon={<NotificationOutlined />} type="primary" onClick={() => setNotifModalVisible(true)}>
          Send Update to All Users
        </Button>
      </Space>

      {/* Statistics Section */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Statistic title="Total Users" value={totalUsers} />
        </Col>
        <Col span={6}>
          <Statistic title="Total Uploads" value={totalUploads} />
        </Col>
        <Col span={6}>
          <Statistic title="Average Uploads" value={averageUploads.toFixed(2)} />
        </Col>
        <Col span={6}>
          <Statistic title="Users with Uploads" value={`${usersWithUploads} (${percentageWithUploads.toFixed(2)}%)`} />
        </Col>
      </Row>

      {/* Chart Section */}
      <Card title="Top 5 Users by Uploads" className="mb-4">
        <BarChart
          width={500}
          height={300}
          data={topUsers.map(user => ({ name: user.displayName, uploads: user.uploadCount }))}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="uploads" fill="#8884d8" />
        </BarChart>
      </Card>

      {/* Responsive Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="_id"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* All Feedback Section */}
      <Card title="All Feedback" className="mb-4">
        <List
          dataSource={feedbacks}
          renderItem={item => (
            <List.Item>
              <div>
                <strong>Title:</strong> {item.title}<br />
                <strong>Type:</strong> {item.type}<br />
                <strong>Description:</strong> {item.description}<br />
                <strong>Rating:</strong> {item.rating}/5
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Notification Modal */}
      <Modal
        title="Send Update Notification"
        open={notifModalVisible}
        onOk={handleSendNotification}
        onCancel={() => setNotifModalVisible(false)}
        ok编写
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
