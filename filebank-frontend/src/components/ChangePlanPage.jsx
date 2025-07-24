import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Row, Col, Button, Typography, message, Form, Input, Badge as AntBadge,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Check, X, ThumbsUp, ThumbsDown, Hourglass } from 'lucide-react';
import api from '../api/fileApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;

const PlanFeature = ({ enabled, label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    {enabled ? <Check className="text-green-600 w-4 h-4" /> : <X className="text-red-500 w-4 h-4" />}
    <span>{label}</span>
  </div>
);

const planFeatures = {
  free: {
    upload: false,
    support: true,
    share: false,
    autoDelete: false,
    ai: false,
    cv: false,
    agents: false,
    feedback: false,
  },
  standard: {
    upload: true,
    support: true,
    share: true,
    autoDelete: true,
    ai: false,
    cv: true,
    agents: false,
    feedback: true,
  },
  premium: {
    upload: true,
    support: true,
    share: true,
    autoDelete: true,
    ai: true,
    cv: true,
    agents: true,
    feedback: true,
  },
};

const plans = [
  { name: 'Free', price: 'R0.00', description: 'Basic access', role: 'free' },
  { name: 'Standard', price: 'R19.00 Once', description: 'CV + Cover Letter help', role: 'standard' },
  { name: 'Premium', price: 'R39.00 Once', description: 'AI assistant + early features', role: 'premium' },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const intervalRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('filebankUser'));
  const [form] = Form.useForm();

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

      if (upgradeStatus === 'pending') {
        message.warning('You already have a pending request.');
        return;
      }

      setLoading(true);

      const { data } = await api.post('/admin/payment-requests', {
        userId: user._id,
        email: user.email,
        plan: selectedPlan.role,
        paymentCode: values.paymentCode,
      });

      setStatusData(data);
      setUpgradeStatus('pending');
      message.success(`Code submitted! Waiting for admin to approve your ${selectedPlan.role} plan.`);
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Code submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest payment request status
const fetchStatus = async () => {
  if (!user?._id) return;
  try {
    const { data } = await api.get(`/admin/payment-requests/${user._id}`);
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1];

      setStatusData(latest);
      setUpgradeStatus(latest.status);

      const matchedPlan = plans.find((p) => p.role === latest.plan);
      if (matchedPlan) {
        setSelectedPlan(matchedPlan);
      }
    }
  } catch (err) {
    console.error('Status fetch error:', err);
  }
};

// Auto-fetch and refresh
useEffect(() => {
  fetchStatus(); // load from backend

  let refreshLimit = 0;

  intervalRef.current = setInterval(() => {
    const modalOpen = document.querySelector('.ant-modal-root')?.style.display === 'block';
    if (!modalOpen && refreshLimit < 15) {
      fetchStatus();
      refreshLimit += 1;
    }
  }, 3000);

  return () => clearInterval(intervalRef.current);
}, []);


  const renderStatusBadge = () => {
    if (!upgradeStatus) return null;

    const statusMap = {
      pending: {
        text: 'Pending Approval',
        icon: <Hourglass className="text-yellow-500 w-4 h-4" />,
        color: 'gold',
      },
      approved: {
        text: 'Plan Approved',
        icon: <ThumbsUp className="text-green-600 w-4 h-4" />,
        color: 'green',
      },
      rejected: {
        text: 'Rejected by Admin',
        icon: <ThumbsDown className="text-red-500 w-4 h-4" />,
        color: 'red',
      },
    };

    const current = statusMap[upgradeStatus];

    return (
      <div className="flex flex-col items-center justify-center mt-3 gap-1">
        <div className="flex items-center gap-2">
          {current.icon}
          <AntBadge color={current.color} text={current.text} />
        </div>
        {statusData?.createdAt && (
          <Text type="secondary" className="text-xs">
            Submitted {dayjs(statusData.createdAt).fromNow()}
          </Text>
        )}
        {upgradeStatus === 'rejected' && (
          <Paragraph type="danger">Reason: {statusData?.rejectionReason || 'No reason provided'}</Paragraph>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          Back
        </Button>
        <Title level={3} style={{ marginBottom: 0, color: '#666' }}>
          Pricing with NO MONTHLY FEES
        </Title>
        <div />
      </div>

      <Row gutter={[24, 24]} justify="center">
        {plans.map((plan) => {
          const features = planFeatures[plan.role];
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
                  boxShadow: isSelected ? '0 4px 16px rgba(30,144,255,0.2)' : undefined,
                }}
                actions={[
                  <Button
                    type="primary"
                    block
                    disabled={isCurrent}
                    onClick={() => handleChoosePlan(plan)}
                  >
                    {isCurrent ? 'Current Plan' : 'Choose Plan'}
                  </Button>,
                ]}
              >
                <Title level={3} style={{ color: '#1E90FF' }}>{plan.price}</Title>
                <Paragraph>{plan.description}</Paragraph>

                <div className="text-left space-y-2 mt-4">
                  <PlanFeature enabled={features.upload} label="Can upload 5 files per upload" />
                  <PlanFeature enabled={features.support} label="Support" />
                  <PlanFeature enabled={features.share} label="Share to social media" />
                  <PlanFeature enabled={features.autoDelete} label="Auto delete after 180 days" />
                  <PlanFeature enabled={features.ai} label="AI Assistant" />
                  <PlanFeature enabled={features.cv} label="CV & Cover Letter" />
                  <PlanFeature enabled={features.agents} label="CV Agents" />
                  <PlanFeature enabled={features.feedback} label="Feedback from Experts" />
                </div>

                {isSelected && !isCurrent && renderStatusBadge()}
              </Card>
            </Col>
          );
        })}
      </Row>

      {selectedPlan && upgradeStatus !== 'approved' && (
        <div className="mt-10 max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
          <Title level={4} style={{ color: '#333' }}>
            What’s Next for the {selectedPlan.name} Plan
          </Title>
          <Paragraph>
            After sending the WhatsApp message, please return to this page and paste your transaction code below.
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={handleSimulatePayment} className="mt-6">
            <Form.Item
              name="paymentCode"
              label="Transaction Code"
              rules={[{ required: true, message: 'Please enter your payment code.' }]}
            >
              <Input placeholder="e.g. 45TRJ970" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Submit Code
            </Button>
          </Form>
        </div>
      )}
    </div>
  );
}

