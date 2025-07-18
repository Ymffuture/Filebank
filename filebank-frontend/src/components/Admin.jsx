import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Avatar,
  Space,
  Modal,
  Dropdown,
  Menu,
  Row,
  Col,
  Card,
  Statistic,
  List,
  message,
  Tag,
  Rate,
  Typography,
  Divider,
  Empty,
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import {
  ArrowLeftOutlined,
  NotificationOutlined,
  EllipsisOutlined,
  MessageOutlined,
  StarOutlined,
  ClockCircleOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Lexical Imports
import {
  LexicalComposer,
  RichTextPlugin,
  ContentEditable,
  HistoryPlugin,
  OnChangePlugin,
  useLexicalComposerContext,
} from '@lexical/react';
import { $generateHtmlFromNodes } from '@lexical/html';

// Styles for Lexical editor
// import './LexicalEditorStyles.css';

const { Text } = Typography;

// Toolbar component for Lexical editor
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const format = (type) => {
    editor.dispatchCommand('FORMAT_TEXT_COMMAND', type);
  };

  return (
    <Space style={{ marginBottom: 12 }}>
      <Button icon={<BoldOutlined />} onClick={() => format('bold')} />
      <Button icon={<ItalicOutlined />} onClick={() => format('italic')} />
      <Button icon={<UnderlineOutlined />} onClick={() => format('underline')} />
      <Button icon={<UndoOutlined />} onClick={() => editor.dispatchCommand('UNDO_COMMAND')} />
      <Button icon={<RedoOutlined />} onClick={() => editor.dispatchCommand('REDO_COMMAND')} />
    </Space>
  );
}

// LexicalNotificationEditor component
function LexicalNotificationEditor({ onSend }) {
  const [editorHtml, setEditorHtml] = useState('');
  const editorRef = useRef(null);

  const initialConfig = {
    namespace: 'NotifyEditor',
    onError: (error) => {
      console.error(error);
    },
  };

  const handleSend = () => {
    if (!editorHtml.trim()) {
      message.warning('Notification content cannot be empty');
      return;
    }
    onSend(editorHtml);
    setEditorHtml('');
    if (editorRef.current) {
      editorRef.current.update(() => {
        const root = editorRef.current.getRootElement();
        if (root) root.innerHTML = '';
      });
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Card
        bodyStyle={{ padding: '16px', background: '#fff', borderRadius: '12px' }}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px' }}
      >
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              ref={editorRef}
              className="lexical-editor"
              style={{
                minHeight: '200px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                overflow: 'auto',
              }}
            />
          }
          placeholder={<div style={{ padding: '12px', color: '#aaa' }}>Write your notification...</div>}
        />
        <HistoryPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            const html = editorState.read(() => $generateHtmlFromNodes(editor));
            setEditorHtml(html);
          }}
        />
        <Button type="primary" block style={{ marginTop: '12px' }} onClick={handleSend}>
          Send Notification
        </Button>
      </Card>
    </LexicalComposer>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [uploadCounts, setUploadCounts] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

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
    return users.map((user) => {
      const countObj = uploadCounts.find((c) => c._id === user._id) || { uploadCount: 0 };
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

  const handleSendNotification = async (htmlMessage) => {
    try {
      await api.post('/admin/notify-all', { message: htmlMessage });
      enqueueSnackbar('Notification sent', { variant: 'success' });
      setNotifModalVisible(false);
    } catch {
      enqueueSnackbar('Failed to send notification', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllFeedback();
    fetchUploadCounts();
  }, []);

  const totalUsers = useMemo(() => mergedUsers.length, [mergedUsers]);
  const totalUploads = useMemo(() => mergedUsers.reduce((sum, u) => sum + u.uploadCount, 0), [mergedUsers]);
  const averageUploads = useMemo(() => (totalUsers ? totalUploads / totalUsers : 0), [totalUsers, totalUploads]);
  const usersWithUploads = useMemo(() => mergedUsers.filter((u) => u.uploadCount > 0).length, [mergedUsers]);
  const percentageWithUploads = useMemo(() => (totalUsers ? (usersWithUploads / totalUsers) * 100 : 0), [totalUsers, usersWithUploads]);
  const topUsers = useMemo(() => [...mergedUsers].sort((a, b) => b.uploadCount - a.uploadCount).slice(0, 5), [mergedUsers]);

  const columns = [
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: (pic) => <Avatar src={pic} />,
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
      },
    },
  ];

  return (
    <div className="p-4" style={{ overflow: 'hidden' }}>
      <Space className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
          Back
        </Button>
        <Button icon={<NotificationOutlined />} type="primary" onClick={() => setNotifModalVisible(true)}>
          Notify All
        </Button>
      </Space>

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

      <Card title="Top 5 Users by Uploads" className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topUsers.map((u) => ({ name: u.displayName, uploads: u.uploadCount }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
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
        <Table dataSource={mergedUsers} columns={columns} rowKey="_id" bordered pagination={{ pageSize: 10 }} />
      </div>

      <Card
        title={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MessageOutlined /> All Feedback
          </div>
        }
        className="mb-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700"
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

                    <Text className="block text-base text-gray-800 dark:text-white mb-1 leading-relaxed">{f.description}</Text>

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
        <LexicalNotificationEditor onSend={handleSendNotification} />
      </Modal>
    </div>
  );
}

