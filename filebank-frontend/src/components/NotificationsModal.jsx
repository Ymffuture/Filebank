import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Popconfirm, Skeleton, Typography, Tooltip } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import Lottie from 'lottie-react';
import verifyAnimation from '../assets/Verified.json'; 
import api from '../api/fileApi';
import { ShieldCheck, CheckCircle, Bell, Crown, BadgeCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
const { Text } = Typography;

export default function NotificationsModal({ visible, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('filebankUser'));

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
    setProcessing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), markAsRead: true } }));
    try {
      await api.put(`notifications/${id}/read`);
      enqueueSnackbar('Marked as read', { variant: 'success' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to mark as read', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), markAsRead: false } }));
    }
  };

  const deleteNotification = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), delete: true } }));
    try {
      await api.delete(`notifications/${id}`);
      enqueueSnackbar('Deleted', { variant: 'info' });
      loadNotifications();
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), delete: false } }));
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
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              width: 40,
              height: 4,
              background: '#fff',
              borderRadius: 2,
              margin: '0 auto 8px',
              opacity: 0.6,
            }}
          />
          <Space style={{ color: '#fff' }}>
            {loading ? (
              <Skeleton.Avatar active size="small" shape="circle" />
            ) : (
              <Bell style={{ color: '#555' }} />
            )}
            Notifications
            {!loading && (
              <Badge
                count={notifications.filter((n) => !n.read).length}
                style={{
                  backgroundColor: '#ff4d4f',
                  color: '#fff',
                  boxShadow: '0 0 0 1px #000 inset',
                }}
              />
            )}
          </Space>
        </div>
      }
      placement="bottom"
      height={580}
      open={visible}
      onClose={onClose}
      styles={{ body: { paddingBottom: 40, color: '#fff' } }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px' }}>
          <Tooltip
            title={
              currentUser?.role === 'free'
                ? 'Upgrade to use this feature'
                : 'Mark all notifications as read'
            }
          >
            <span>
              <Button
                onClick={currentUser?.role === 'free' ? undefined : markAllAsRead}
                icon={currentUser?.role === 'free' ? <Crown size={18} /> : <CheckOutlined />}
                loading={markAllLoading}
                type="dashed"
                disabled={currentUser?.role === 'free' || notifications < 0}
              >
                Mark All as Read
              </Button>
            </span>
          </Tooltip>
        </div>
      }
    >
      {loading ? (
        <List
          dataSource={[1, 2, 3, 4]} // fake skeleton items
          renderItem={(i) => (
            <List.Item style={{ padding: '8px 12px' }}>
              <Skeleton active avatar title={false} paragraph={{ rows: 2 }} />
            </List.Item>
          )}
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: !item.read ? '#fffbe6' : 'whitesmoke',
                borderRadius: 8,
                padding: '8px 12px',
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
                      {item.fromUser?.role === 'admin'
                        ? 'Famacloud'
                        : 'Famacloud Notification'}
                    </span>
                    {item.fromUser?.role === 'admin' ? (
                      <Lottie
                        animationData={verifyAnimation}
                        loop={true}
                        style={{ width: 20, height: 20 }}
                      />
                    ) : item.fromUser?.role !== 'free' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BadgeCheck color="gold" size={18} />
                        <Bell color="#1E90FF" size={16} />
                      </span>
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
              <div
                style={{ marginTop: 4, fontSize: 13 }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.message, {
                    ALLOWED_TAGS: [
                      'b',
                      'i',
                      'strong',
                      'em',
                      'a',
                      'p',
                      'span',
                      'div',
                      'br',
                      'ul',
                      'li',
                      'ol',
                      'img',
                      'button',
                    ],
                    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'onclick'],
                  }),
                }}
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
