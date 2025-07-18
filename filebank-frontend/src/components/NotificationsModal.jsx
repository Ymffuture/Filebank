import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Popconfirm, Spin, Typography } from 'antd';
import { DeleteOutlined, CheckOutlined, BellOutlined, CloseOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import Lottie from 'lottie-react';
import verifyAnimation from '../assets/Verified.json'; 
import api from '../api/fileApi';
import { ShieldCheck, CheckCircle, Bell } from 'lucide-react';
import parse from 'html-react-parser';

const { Paragraph, Text } = Typography;

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
      height={580}
      open={visible}
      onClose={onClose}
      styles={{
        body: { borderRadius: '25px 25px 0 0', paddingBottom: 60 },
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px' }}>
          <Button
            onClick={markAllAsRead}
            icon={<CheckOutlined />}
            loading={markAllLoading}
            type="dashed"
          >
            Mark All as Read
          </Button>
          <Button
            onClick={onClose}
            icon={<CloseOutlined />}
            type="link"
            style={{ fontSize: 16 }}
          >
            Close
          </Button>
        </div>
      }
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
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 8,
                boxShadow: !item.read ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
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
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={processing[item._id]?.delete}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 14 }}>
                      {item.fromUser?.role === 'admin' ? 'Famacloud' : 'Famacloud Notification'}
                    </span>
                    {item.fromUser?.role === 'admin' ? (
                      <Lottie
                        animationData={verifyAnimation}
                        loop={true}
                        style={{ width: 20, height: 20 }}
                      />
                    ) : (
                      <Bell color="#1E90FF" size={20} />
                    )}
                    
                  </div>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString('en-ZA', { hour12: false })}
                  </Text>
                }
              />
              <Paragraph style={{ marginTop: 4, fontSize: 13 }}>
                {parse(item.message)}
              </Paragraph>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}

