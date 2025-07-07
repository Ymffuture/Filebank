import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Popconfirm, Spin } from 'antd';
import { DeleteOutlined, CheckOutlined, BellOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';
import { ShieldCheck, CheckCircle } from 'lucide-react';
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
      placement="bottom"
      height={650}
      visible={visible}
      onClose={onClose}
      footer={[
        <Button
          key="markAll"
          onClick={markAllAsRead}
          icon={<CheckOutlined />}
          loading={markAllLoading}
        />,
        <Button key="close" onClick={onClose} icon={<DeleteOutlined />}/>,
      ]}
    >
      {loading ? (
        <Spin />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: !item.read ? '#fffbe6' : 'transparent',
                borderRadius: 4,
                padding: '12px 16px',
                marginBottom: 8,
              }}
              actions={[
                !item.read && (
                  <Popconfirm
                    title="Mark as read?"
                    onConfirm={() => markAsRead(item._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="link"
                      size="small"
                      icon={<CheckOutlined />}
                      loading={processing[item._id]?.markAsRead}
                    />
                  </Popconfirm>
                ),
                <Popconfirm
                  title="Delete this notification?"
                  onConfirm={() => deleteNotification(item._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    loading={processing[item._id]?.delete}
                  />
                </Popconfirm>,
              ]}
            >
<List.Item.Meta
  title={
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span className='text-[13px]'>{item.fromUser?.role === 'admin' ? 'Filebank' : item.fromUser?.name}</span>
        {item.fromUser?.role === 'admin' && (
          <CheckCircle 
      className='text-[8px]' 
      title="Admin" 
      style={{
               color: '#1E90FF',
               transform: 'scale(0.6)',
               transformOrigin: 'center center',  
               display: 'inline-block' 
            }} />
        )}
      </div>
      <div style={{ fontWeight: item.read ? 'normal' : 'bold', marginTop: 2 }}>
        {item.message}
      </div>
    </div>
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
