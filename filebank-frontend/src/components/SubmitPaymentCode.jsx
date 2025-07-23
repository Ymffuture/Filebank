// components/SubmitPaymentCode.js
import React, { useState } from 'react';
import { Button, Input, Select, message } from 'antd';
import api from '../api/fileApi';

const SubmitPaymentCode = () => {
  const [plan, setPlan] = useState('premium');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code) return message.warning('Enter your payment code');
    setLoading(true);
    try {
      await api.post('/payment-requests', { plan, paymentCode: code });
      message.success('Payment code submitted!');
      setCode('');
    } catch {
      message.error('Failed to submit code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-4 shadow-md rounded bg-white">
      <h2 className="mb-4 text-lg font-semibold">Upgrade Plan</h2>
      <Select value={plan} onChange={setPlan} className="w-full mb-3">
        <Select.Option value="premium">Premium</Select.Option>
        <Select.Option value="standard">Standard</Select.Option>
      </Select>
      <Input
        placeholder="Enter your payment code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mb-3"
      />
      <Button type="primary" loading={loading} onClick={handleSubmit}>
        Submit Code
      </Button>
    </div>
  );
};

export default SubmitPaymentCode;
