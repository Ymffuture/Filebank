import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Popconfirm, Spin } from 'antd';
import { DeleteOutlined, CheckOutlined, BellOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

export default function NotificationsModal({ visible, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/all');
      setNotifications(res.data);
    } catch (err) {
      enqueueSnackbar('Failed to load notifications', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadNotifications();
  }, [visible]);

  const markAsRead = async (id) => {
    setProcessing((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), markAsRead: true },
    }));
    try {
      await api.put(`notifications/${id}/read`);
      enqueueSnackbar('Marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark as read', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), markAsRead: false },
      }));
    }
  };

  const deleteNotification = async (id) => {
    setProcessing((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), delete: true },
    }));
    try {
      await api.delete(`notifications/${id}`);
      enqueueSnackbar('Deleted', { variant: 'info' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), delete: false },
      }));
    }
  };

  const markAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => api.put(`/notifications/${n._id}/read`))
      );
      enqueueSnackbar('All marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark all', { variant: 'error' });
    } finally {
      setMarkAllLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BellOutlined /> Notifications
          <Badge count={notifications.filter((n) => !n.read).length} />
        </Space>
      }
      placement="right"
      width={400}
      visible={visible}
      onClose={onClose}
      footer={[
        <Button
          key="markAll"
          onClick={markAllAsRead}
          icon={<CheckOutlined />}
          loading={markAllLoading}
        >
          Mark All as Read
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {loading ? (
        <Spin />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: !item.read ? '#fffbe6' : 'transparent',
                borderRadius: 4,
                padding: '8px 12px',
                marginBottom: 4,
              }}
              actions={[
                !item.read && (
                  <Button
                    type="link"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => markAsRead(item._id)}
                    loading={processing[item._id]?.markAsRead}
                  >
                    Mark as Read
                  </Button>
                ),
                <Popconfirm
                  title="Delete this notification?"
                  onConfirm={() => deleteNotification(item._id)}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={processing[item._id]?.delete}
                  >
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                    {item.message}
                  </span>
                }
                description={new Date(item.createdAt).toLocaleString()}
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
