import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  Badge,
  Button,
  Space,
  Popconfirm,
  Typography,
  Tooltip,
  Skeleton,
} from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import Lottie from 'lottie-react';
import verifyAnimation from '../assets/Verified.json';
import api from '../api/fileApi';
import { ShieldCheck, CheckCircle, Bell, Crown, BadgeCheck } from 'lucide-react';
import DOMPurify from 'dompurify';

const { Paragraph, Text } = Typography;

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
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      enqueueSnackbar('Notification marked as read', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to mark as read', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteNotification = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      enqueueSnackbar('Notification deleted', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete notification', { variant: 'error' });
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const markAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      await api.put('/notifications/markAllRead');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      enqueueSnackbar('All notifications marked as read', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to mark all as read', { variant: 'error' });
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
            {loading ? (
              <Skeleton.Input active size="small" style={{ width: 30 }} />
            ) : (
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
      styles={{
        body: { paddingBottom: 40, color: '#fff' },
      }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 16px',
          }}
        >
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
                icon={
                  currentUser?.role === 'free' ? (
                    <Crown size={18} />
                  ) : (
                    <CheckOutlined />
                  )
                }
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
          itemLayout="vertical"
          dataSource={[1, 2, 3, 4]}
          renderItem={(key) => (
            <List.Item
              style={{
                backgroundColor: 'whitesmoke',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 8,
              }}
            >
              <List.Item.Meta
                avatar={<Skeleton.Avatar active size="small" />}
                title={
                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                }
                description={
                  <Skeleton.Input active size="small" style={{ width: 80 }} />
                }
              />
              <Skeleton active paragraph={{ rows: 2 }} />
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
                backgroundColor: item.read ? '#f9f9f9' : '#e6f7ff',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 8,
              }}
              actions={[
                <Tooltip title="Mark as read" key="mark-read">
                  <Button
                    type="link"
                    icon={<CheckCircle size={18} />}
                    onClick={() => markAsRead(item._id)}
                    loading={processing[item._id]}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Delete this notification?"
                  onConfirm={() => deleteNotification(item._id)}
                  okText="Yes"
                  cancelText="No"
                  key="delete"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    loading={processing[item._id]}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'verify' ? (
                    <Lottie
                      animationData={verifyAnimation}
                      style={{ width: 30, height: 30 }}
                    />
                  ) : item.type === 'security' ? (
                    <ShieldCheck size={28} color="blue" />
                  ) : (
                    <BadgeCheck size={28} color="green" />
                  )
                }
                title={
                  <Text strong>
                    {item.title || 'Notification'}
                    {!item.read && (
                      <Badge
                        status="processing"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Text>
                }
                description={
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: true }}
                    style={{ marginBottom: 0 }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(item.message),
                    }}
                  />
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}

