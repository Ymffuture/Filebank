import React, { useEffect, useState } from 'react';
import { Modal, List, Badge, Button, Space, Popconfirm, Spin, Divider } from 'antd';
import { DeleteOutlined, CheckOutlined, BellOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

export default function NotificationsModal({ visible, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
    setActionLoading(true);
    try {
      await api.put(`notifications/${id}/read`);
      enqueueSnackbar('Marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark as read', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    setActionLoading(true);
    try {
      await api.delete(`notifications/${id}`);
      enqueueSnackbar('Deleted', { variant: 'info' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(true);
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => api.put(`/notifications/${n._id}/read`))
      );
      enqueueSnackbar('All marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark all', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAllNotifications = async () => {
    setActionLoading(true);
    try {
      await api.delete('/notifications/all');
      enqueueSnackbar('All notifications deleted', { variant: 'info' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to delete all', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      bodyStyle={{ padding: 0 }}
    >
      <div className="p-6 border-b border-gray-200">
        <Space>
          <BellOutlined style={{ fontSize: 20 }} />
          <span className="font-semibold text-lg">Notifications</span>
          <Badge count={notifications.filter(n => !n.read).length} />
        </Space>
      </div>

      <div className="p-4" style={{ minHeight: 300 }}>
        {loading ? (
          <div className="text-center p-10">
            <Spin />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                actions={[
                  !item.read && (
                    <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => markAsRead(item._id)} loading={actionLoading}>
                      Mark as Read
                    </Button>
                  ),
                  <Popconfirm title="Delete this notification?" onConfirm={() => deleteNotification(item._id)}>
                    <Button type="link" danger size="small" icon={<DeleteOutlined />} loading={actionLoading}>
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
      </div>

      <Divider style={{ margin: 0 }} />

      <div className="p-4 flex justify-end space-x-2">
        <Button icon={<CheckOutlined />} onClick={markAllAsRead} loading={actionLoading}>
          Mark All as Read
        </Button>
        <Popconfirm title="Delete all notifications?" onConfirm={deleteAllNotifications}>
          <Button icon={<DeleteOutlined />} danger loading={actionLoading}>
            Delete All
          </Button>
        </Popconfirm>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

