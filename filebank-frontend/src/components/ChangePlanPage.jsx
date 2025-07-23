import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, message, Modal, Form, Input } from 'antd';
import api from '../api/fileApi';

const { Title, Paragraph } = Typography;

const plans = [
  {
    name: 'Free',
    price: 'R0',
    description: 'Basic access to upload and manage files.',
    role: 'free',
  },
  {
    name: 'Standard',
    price: 'R79/month',
    description: 'Cover letter help, CV advice, and recruiter access.',
    role: 'standard',
  },
  {
    name: 'Premium',
    price: 'R129/month',
    description: 'AI assistant, file tools, early access to features.',
    role: 'premium',
  },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem('filebankUser'));

  const openPaymentModal = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleSimulatePayment = async () => {
    try {
      const values = await form.validateFields();
      if (!user || !user._id) {
        message.error('User not found.');
        return;
      }

      setLoading(true);
      await api.put(`/admin/users/${user._id}/role`, { role: selectedPlan.role });

      const updatedUser = { ...user, role: selectedPlan.role };
      localStorage.setItem('filebankUser', JSON.stringify(updatedUser));

      message.success(`Payment successful! Role upgraded to ${selectedPlan.role}`);
      setIsPaymentModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      message.error('Payment or role update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2} className="text-center">Choose Your Plan</Title>
      <Row gutter={[24, 24]} justify="center">
        {plans.map(plan => (
          <Col xs={24} sm={12} md={8} key={plan.name}>
            <Card
              title={plan.name}
              bordered
              style={{ textAlign: 'center', borderColor: '#1E90FF' }}
              actions={[
                <Button
                  type="primary"
                  block
                  disabled={user?.role === plan.role}
                  onClick={() => openPaymentModal(plan)}
                >
                  {user?.role === plan.role ? 'Current Plan' : 'Choose Plan'}
                </Button>
              ]}
            >
              <Title level={3}>{plan.price}</Title>
              <Paragraph>{plan.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`Simulated Payment - ${selectedPlan?.name} Plan`}
        open={isPaymentModalOpen}
        onOk={handleSimulatePayment}
        confirmLoading={loading}
        onCancel={() => setIsPaymentModalOpen(false)}
        okText="Simulate Payment"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="paymentCode"
            label="Fake Transaction Code"
            rules={[{ required: true, message: 'Enter a transaction code to simulate payment.' }]}
          >
            <Input placeholder="e.g. ABC123456789" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
