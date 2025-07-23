import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, message, Modal, Form, Input, Badge } from 'antd';
import api from '../api/fileApi';

const { Title, Paragraph } = Typography;

const plans = [
  { name: 'Free', price: 'R0', description: 'Basic access', role: 'free' },
  { name: 'Standard', price: 'R79/month', description: 'CV + Cover Letter help', role: 'standard' },
  { name: 'Premium', price: 'R129/month', description: 'AI assistant + early features', role: 'premium' },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('filebankUser'));

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);

    // 👇 Redirect to WhatsApp
    const whatsappMessage = `Hi, I would like to upgrade to the *${plan.name}* plan. My email is ${user?.email}`;
    const whatsappUrl = `https://wa.me/27634414863?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');

    // 👇 Open modal to enter payment code
    setTimeout(() => {
      setIsPaymentModalOpen(true);
    }, 1000);
  };

  const handleSimulatePayment = async () => {
    try {
      const values = await form.validateFields();
      if (!user || !user._id) {
        message.error('User not found.');
        return;
      }

      setLoading(true);

      // 👇 Send payment code to backend
      await api.post(`/admin/users/${user._id}/confirm-payment`, {
        role: selectedPlan.role,
        paymentCode: values.paymentCode,
      });

      message.success(`Code submitted! Waiting for admin to approve your ${selectedPlan.role} plan.`);
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error('Code submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2} className="text-center">Choose Your Plan</Title>
      <Row gutter={[24, 24]} justify="center">
        {plans.map(plan => {
          const isCurrent = user?.role === plan.role;

          return (
            <Col xs={24} sm={12} md={8} key={plan.name}>
              <Card
                title={plan.name}
                bordered
                style={{ textAlign: 'center', borderColor: '#1E90FF' }}
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
                <Title level={3}>{plan.price}</Title>
                <Paragraph>{plan.description}</Paragraph>

                {/* 👇 Show a pending badge if user tried upgrading */}
                {!isCurrent && selectedPlan?.role === plan.role && (
                  <Badge status="processing" text="Waiting for admin confirmation..." />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 🔐 Modal to enter code */}
      <Modal
        title={`Enter Payment Code - ${selectedPlan?.name} Plan`}
        open={isPaymentModalOpen}
        onOk={handleSimulatePayment}
        confirmLoading={loading}
        onCancel={() => setIsPaymentModalOpen(false)}
        okText="Submit Code"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="paymentCode"
            label="Transaction Code"
            rules={[{ required: true, message: 'Enter the code you received.' }]}
          >
            <Input placeholder="e.g. ABC123456" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

