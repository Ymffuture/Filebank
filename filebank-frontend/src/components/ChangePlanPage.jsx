import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, message, Form, Input, Badge } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

const { Title, Paragraph, Text } = Typography;

const plans = [
  { name: 'Free', price: 'R0', description: 'Basic access', role: 'free' },
  { name: 'Standard', price: 'R79/month', description: 'CV + Cover Letter help', role: 'standard' },
  { name: 'Premium', price: 'R129/month', description: 'AI assistant + early features', role: 'premium' },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('filebankUser'));

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    const whatsappMessage = `Hi, I would like to upgrade to the *${plan.name}* plan. My email is ${user?.email}`;
    const whatsappUrl = `https://wa.me/27634414863?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  
  const handleSimulatePayment = async () => {
  try {
    const values = await form.validateFields();
    if (!user || !user._id) {
      message.error('User not found.');
      return;
    }

    setLoading(true);

    // Correct API route to submit a payment code
    await api.post('/admin/payment-requests', {
      userId: user._id,
      email: user.email,
      plan: selectedPlan.role,
      paymentCode: values.paymentCode,
    });

    message.success(`Code submitted! Waiting for admin to approve your ${selectedPlan.role} plan.`);
  } catch (err) {
    console.error(err);
    message.error('Code submission failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          Back
        </Button>
        <Title level={3} style={{ marginBottom: 0, color: '#1E90FF' }}>Quorvex Institute – Upgrade Plan</Title>
        <div /> {/* empty for spacing */}
      </div>

      {/* Plans */}
      <Row gutter={[24, 24]} justify="center">
        {plans.map(plan => {
          const isCurrent = user?.role === plan.role;
          const isSelected = selectedPlan?.role === plan.role;

          return (
            <Col xs={24} sm={12} md={8} key={plan.name}>
              <Card
                title={<Text strong>{plan.name}</Text>}
                bordered
                style={{
                  textAlign: 'center',
                  borderColor: isSelected ? '#1E90FF' : '#f0f0f0',
                  boxShadow: isSelected ? '0 4px 16px rgba(30,144,255,0.2)' : undefined
                }}
                actions={[
                  <Button
                    type="primary"
                    block
                    disabled={isCurrent}
                    onClick={() => handleChoosePlan(plan)}
                  >
                    {isCurrent ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                ]}
              >
                <Title level={3} style={{ color: '#1E90FF' }}>{plan.price}</Title>
                <Paragraph>{plan.description}</Paragraph>
                {!isCurrent && isSelected && (
                  <Badge status="processing" text="Waiting for admin confirmation..." />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Payment Code Entry */}
      {selectedPlan && (
        <div className="mt-10 max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
          <Title level={4} style={{ color: '#333' }}>Enter Code for {selectedPlan.name} Plan</Title>
          <Form form={form} layout="vertical" onFinish={handleSimulatePayment}>
            <Form.Item
              name="paymentCode"
              label="Transaction Code"
              rules={[{ required: true, message: 'Please enter your payment code.' }]}
            >
              <Input placeholder="e.g. ABC123456" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Submit Code
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
}

