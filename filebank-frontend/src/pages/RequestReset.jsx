
import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import api from '../api/fileApi';

export default function RequestReset() {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/request-reset', { email });
      message.success('Reset link sent to your email');
    } catch (err) {
      message.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Reset Password" style={{ maxWidth: 400, margin: '80px auto' }}>
      <Form onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Send Reset Link
        </Button>
      </Form>
    </Card>
  );
}
