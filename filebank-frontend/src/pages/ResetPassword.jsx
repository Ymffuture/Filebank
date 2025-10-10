import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { useSnackbar } from 'notistack';
import api from '../api/fileApi';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onFinish = async ({ newPassword }) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: query.get('token'),
        email: query.get('email'),
        newPassword,
      });

      enqueueSnackbar('Password reset successful', { variant: 'success' });
      navigate('/');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Reset failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Set New Password" style={{ maxWidth: 400, margin: '80px auto' }}>
      <Form onFinish={onFinish} layout="vertical">
        {/* New Password */}
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Enter your new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="New Password" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Reset Password
        </Button>
      </Form>
    </Card>
  );
}

