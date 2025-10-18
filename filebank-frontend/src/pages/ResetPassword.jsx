import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // 👈 use Notistack

  const onFinish = async ({ newPassword }) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: query.get('token'),
        email: query.get('email'),
        newPassword
      });
      enqueueSnackbar('Password reset successful', { variant: 'success' }); // ✅ Success toast
      navigate('/');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Reset failed', { variant: 'error' }); // ❌ Error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Set New Password" style={{ maxWidth: 400, margin: '80px auto' }}>
      <Form onFinish={onFinish}>
        <Form.Item name="newPassword" rules={[{ required: true, message: 'Enter new password' }]}>
          <Input.Password placeholder="New Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Reset Password
        </Button>
      </Form>
    </Card>
  );
}
