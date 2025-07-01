import React, { useEffect, useState } from 'react';
import { Modal, List, Badge, Button, Space, Popconfirm, Spin } from 'antd';
import { DeleteOutlined, CheckOutlined, BellOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

export default function NotificationsModal({ visible, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

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
    try {
      await api.put(`notifications/${id}/read`);
      enqueueSnackbar('Marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark as read', { variant: 'error' });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`notifications/${id}`);
      enqueueSnackbar('Deleted', { variant: 'info' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => api.put(`/notifications/${n._id}/read`))
      );
      enqueueSnackbar('All marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark all', { variant: 'error' });
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BellOutlined /> Notifications
          <Badge count={notifications.filter(n => !n.read).length} />
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="markAll" onClick={markAllAsRead} icon={<CheckOutlined />}>
          Mark All as Read
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      {loading ? (
        <Spin />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              actions={[
                !item.read && (
                  <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => markAsRead(item._id)}>
                    Mark as Read
                  </Button>
                ),
                <Popconfirm title="Delete this notification?" onConfirm={() => deleteNotification(item._id)}>
                  <Button type="link" danger icon={<DeleteOutlined />} size="small">
                    Delete
                  </Button>
                </Popconfirm>
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
    </Modal>
  );
}

