import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Typography, message,
  Form, Input, Badge as AntBadge
} from 'antd';
import Navbar from './Navbar';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Check, X, ThumbsUp, ThumbsDown, Hourglass } from 'lucide-react';
import api from '../api/fileApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSnackbar } from 'notistack';
import {Helmet} from 'react-helmet' ;
dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;

const PlanFeature = ({ enabled, label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    {enabled ? <Check className="text-green-600 w-4 h-4" /> : <X className="text-red-500 w-4 h-4" />}
    <span>{label}</span>
  </div>
);

const planFeatures = {
  free: { upload: true, support: true, share: false, autoDelete: false, ai: false, cv: false, agents: false, feedback: false },
  standard: { upload: true, support: true, share: true, autoDelete: true, ai: false, cv: true, agents: false, feedback: true },
  premium: { upload: true, support: true, share: true, autoDelete: true, ai: true, cv: true, agents: true, feedback: true },
};

const plans = [
  { name: 'Free', price: 'R0', description: 'Basic access', role: 'free' },
  { name: 'Standard', price: 'R19 Once', description: 'CV + Cover Letter help', role: 'standard' },
  { name: 'Premium', price: 'R39 Once', description: 'AI assistant + early features', role: 'premium' },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const user = JSON.parse(localStorage.getItem('filebankUser'));

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    const whatsappMessage = `Hi, I would like to upgrade to the *${plan.name}* plan. My email is ${user?.email}`;
    const whatsappUrl = `https://wa.me/27653935339?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSimulatePayment = async () => {
    try {
      const values = await form.validateFields();
      if (!user || !user._id) {
        enqueueSnackbar('User not found.');
        return;
      }

      if (upgradeStatus === 'pending') {
        enqueueSnackbar('You already have a pending request.');
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
      enqueueSnackbar(`Code submitted! Waiting for admin to approve your ${selectedPlan.role} plan.`);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Code submission failed');
    } finally {
      setLoading(false);
    }
  };

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
        text: 'Rejected by Famacloud',
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
        {upgradeStatus === 'rejected' && statusData?.rejectionReason && (
          <Paragraph type="danger" style={{ color: 'red' }}>
            Reason: {statusData.rejectionReason}
          </Paragraph>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?._id) return;
      try {
        const { data } = await api.get(`/admin/payment-requests/${user._id}`);
        if (data?.status) {
          setStatusData(data);
          setUpgradeStatus(data.status);

          if (data.plan) {
            const match = plans.find((p) => p.role === data.plan);
            if (match) setSelectedPlan(match);
          }
        }
      } catch (err) {
        console.warn('No upgrade status found:', err);
      }
    };
    fetchStatus();
  }, [user?._id]);

  return (
    <>
      <Navbar/>
      
      <Helmet >
        <title >Change plan | best-selling R39</title >
        </Helmet> 
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          Back
        </Button>
        <Title level={3} style={{ marginBottom: 0, color: '#1E90FF' }}>
          🔥 Best pricing board  
        </Title>
        <div />
        
      </div>
<Paragraph style={{color:'gold', background:'#666', padding:'4px', borderRadius:'5px'}} >
            After sending the WhatsApp message, return here and paste your transaction code.
            The code will be verified by the Famacloud.
     </Paragraph>
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
    type={isCurrent ? 'default' : 'primary'}
    block
    size="large"
    disabled={isCurrent}
    style={{
      borderRadius: '8px',
      fontWeight: 600,
      backgroundColor: isCurrent ? '#f0f0f0' : '#1677ff',
      color: isCurrent ? '#999' : '#fff',
      boxShadow: !isCurrent && '0 4px 12px rgba(22, 119, 255, 0.3)',
      transition: 'all 0.3s ease-in-out',
    }}
    onClick={() => !isCurrent && handleChoosePlan(plan)}
  >
    {isCurrent ? '✔ Current Plan' : '✨ Choose Plan'} 
    
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
            After sending the WhatsApp message, return here and paste your transaction code.
            The code will be verified by the Famacloud.
          </Paragraph>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            <li><strong>Pending:</strong> Waiting for Famacloud confirmation</li>
            <li><strong>Approved:</strong> Your plan is active</li>
            <li><strong>Rejected:</strong> Code invalid or payment issue</li>
          </ul>

          <Form form={form} layout="vertical" onFinish={handleSimulatePayment} className="mt-6">
            <Form.Item
              name="paymentCode"
              label="Transaction Code"
              rules={[{ required: true, message: 'Please enter your payment code.' }]}
            >
              <Input placeholder="e.g. 45TRJ970" />
            </Form.Item>
            <Button type="dashed" htmlType="submit" loading={loading} block disabled={loading} >
              Submit the code 
            </Button>
          </Form>
        </div>
      )}
    </div>
      </>
  );
}
