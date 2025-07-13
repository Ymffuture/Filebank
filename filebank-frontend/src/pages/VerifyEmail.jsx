import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import api from '../api/fileApi';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    const verify = async () => {
      try {
        const token = query.get('token');
        const email = query.get('email');
        const { data } = await api.get(`/auth/verify-email?token=${token}&email=${email}`);
        setStatus({ success: true, message: data.message });
      } catch (err) {
        setStatus({ success: false, message: err.response?.data?.message || 'Verification failed' });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  if (loading) return <Spin tip="Verifying email..." size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Result
      status={status.success ? 'success' : 'error'}
      title={status.success ? 'Email Verified' : 'Verification Failed'}
      subTitle={status.message}
      extra={[
        <Button type="primary" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      ]}
    />
  );
}

