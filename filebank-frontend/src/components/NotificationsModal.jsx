import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Popconfirm, Spin, Typography, Tooltip, Skeleton } from 'antd';
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

  const markAsRead = async (id) => { /* unchanged */ };
  const deleteNotification = async (id) => { /* unchanged */ };
  const markAllAsRead = async () => { /* unchanged */ };

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
              opacity: 0.6
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
                  boxShadow: '0 0 0 1px #000 inset'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px' }}>
          <Tooltip
            title={
              currentUser?.role === 'free'
                ? "Upgrade to use this feature"
                : "Mark all notifications as read"
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
          itemLayout="vertical"
          dataSource={[1, 2, 3, 4]} // skeleton placeholders
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
                title={<Skeleton.Input active size="small" style={{ width: 120 }} />}
                description={<Skeleton.Input active size="small" style={{ width: 80 }} />}
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
            // ... your unchanged renderItem code here
            <List.Item>{/* unchanged */}</List.Item>
          )}
        />
      )}
    </Drawer>
  );
}

