import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Form,
  Input,
  Badge as AntBadge,
  Tag,
} from "antd";
import Navbar from "./Navbar";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Check, X, ThumbsUp, ThumbsDown, Hourglass } from "lucide-react";
import api from "../api/fileApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSnackbar } from "notistack";
import { Helmet } from "react-helmet";

dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;

const PlanFeature = ({ enabled, label }) => (
  <div className="flex items-center gap-2 text-sm">
    <div
      className={`w-5 h-5 flex items-center justify-center rounded-full ${
        enabled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
      }`}
    >
      {enabled ? <Check size={14} /> : <X size={14} />}
    </div>
    <span className="text-gray-700">{label}</span>
  </div>
);

const planFeatures = {
  free: {
    upload: true,
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
  {
    name: "Free",
    price: "R0",
    description: "Basic access",
    role: "free",
  },
  {
    name: "Standard",
    price: "R19 Once",
    description: "CV + Cover Letter help",
    role: "standard",
  },
  {
    name: "Premium",
    price: "R39 Once",
    description: "AI assistant + early features",
    role: "premium",
    best: true,
  },
];

export default function ChangePlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const user = JSON.parse(localStorage.getItem("filebankUser"));

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    const whatsappMessage = `Hi, I would like to upgrade to the *${plan.name}* plan. My email is ${user?.email}`;
    const whatsappUrl = `https://wa.me/27653935339?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSimulatePayment = async () => {
    try {
      const values = await form.validateFields();
      if (!user || !user._id) {
        enqueueSnackbar("User not found.");
        return;
      }

      if (upgradeStatus === "pending") {
        enqueueSnackbar("You already have a pending request.");
        return;
      }

      setLoading(true);

      const { data } = await api.post("/admin/payment-requests", {
        userId: user._id,
        email: user.email,
        plan: selectedPlan.role,
        paymentCode: values.paymentCode,
      });

      setStatusData(data);
      setUpgradeStatus("pending");
      enqueueSnackbar(
        `Code submitted! Waiting for admin to approve your ${selectedPlan.role} plan.`
      );
    } catch (err) {
      enqueueSnackbar("Code submission failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    if (!upgradeStatus) return null;

    const statusMap = {
      pending: {
        text: "Pending Approval",
        icon: <Hourglass className="text-yellow-500 w-4 h-4" />,
        color: "gold",
      },
      approved: {
        text: "Plan Approved",
        icon: <ThumbsUp className="text-green-600 w-4 h-4" />,
        color: "green",
      },
      rejected: {
        text: "Rejected by Famacloud",
        icon: <ThumbsDown className="text-red-500 w-4 h-4" />,
        color: "red",
      },
    };

    const current = statusMap[upgradeStatus];

    return (
      <div className="flex flex-col items-center justify-center mt-4 gap-1">
        <div className="flex items-center gap-2">
          {current.icon}
          <AntBadge color={current.color} text={current.text} />
        </div>
        {statusData?.createdAt && (
          <Text type="secondary" className="text-xs">
            Submitted {dayjs(statusData.createdAt).fromNow()}
          </Text>
        )}
        {upgradeStatus === "rejected" && statusData?.rejectionReason && (
          <Paragraph type="danger" className="text-red-600 text-sm">
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
      } catch {}
    };
    fetchStatus();
  }, [user?._id]);

  return (
    <>
      <Navbar />
      <Helmet>
        <title>Change plan | Famacloud Pricing</title>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#202124] to-[#1677ff] text-white py-12 text-center">
        <Title level={2} style={{ color: "#fff" }}>
          💎 Upgrade Your Famacloud Experience
        </Title>
        <Paragraph style={{ color: "#eee" }}>
          Choose the best plan for you — from Free to Premium AI-powered tools.
        </Paragraph>
      </div>

      <div className="min-h-screen bg-gray-50 p-8">
        <Row gutter={[24, 24]} justify="center">
          {plans.map((plan) => {
            const features = planFeatures[plan.role];
            const isCurrent = user?.role === plan.role;
            const isSelected = selectedPlan?.role === plan.role;

            return (
              <Col xs={24} sm={12} md={8} key={plan.name}>
                <Card
                  className={`rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 ${
                    plan.best ? "border-2 border-yellow-500" : ""
                  }`}
                  title={
                    <div className="flex justify-between items-center">
                      <Text strong>{plan.name}</Text>
                      {plan.best && (
                        <Tag color="gold" className="font-bold">
                          ⭐ Best Seller
                        </Tag>
                      )}
                    </div>
                  }
                  bordered
                  style={{
                    textAlign: "center",
                    borderColor: isSelected ? "#1677ff" : "#f0f0f0",
                  }}
                  actions={[
                    <Button
                      type={isCurrent ? "default" : "primary"}
                      block
                      size="large"
                      disabled={isCurrent}
                      className="rounded-lg font-semibold"
                      style={{
                        background: isCurrent
                          ? "#f0f0f0"
                          : "linear-gradient(90deg,#1677ff,#0052cc)",
                        color: isCurrent ? "#666" : "#fff",
                      }}
                      onClick={() => !isCurrent && handleChoosePlan(plan)}
                    >
                      {isCurrent ? "✔ Current Plan" : "✨ Choose Plan"}
                    </Button>,
                  ]}
                >
                  <Title level={3} style={{ color: "#1677ff" }}>
                    {plan.price}
                  </Title>
                  <Paragraph>{plan.description}</Paragraph>

                  <div className="text-left space-y-2 mt-4">
                    <PlanFeature
                      enabled={features.upload}
                      label="Can upload 5 files per upload"
                    />
                    <PlanFeature enabled={features.support} label="Support" />
                    <PlanFeature
                      enabled={features.share}
                      label="Share to social media"
                    />
                    <PlanFeature
                      enabled={features.autoDelete}
                      label="Auto delete after 180 days"
                    />
                    <PlanFeature enabled={features.ai} label="AI Assistant" />
                    <PlanFeature
                      enabled={features.cv}
                      label="CV & Cover Letter"
                    />
                    <PlanFeature enabled={features.agents} label="CV Agents" />
                    <PlanFeature
                      enabled={features.feedback}
                      label="Feedback from Experts"
                    />
                  </div>

                  {isSelected && !isCurrent && renderStatusBadge()}
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Transaction Code Section */}
        {selectedPlan && upgradeStatus !== "approved" && (
          <div className="mt-12 max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <Title level={4}>🔑 Submit Your Transaction Code</Title>
            <Paragraph className="text-gray-600">
              After sending the WhatsApp message, paste your transaction code
              here for verification by Famacloud.
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSimulatePayment}
              className="mt-6"
            >
              <Form.Item
                name="paymentCode"
                label="Transaction Code"
                rules={[
                  { required: true, message: "Please enter your payment code." },
                ]}
              >
                <Input placeholder="e.g. 45TRJ970" className="rounded-lg" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                disabled={loading}
                className="rounded-lg"
                style={{
                  background: "linear-gradient(90deg,#1677ff,#0052cc)",
                  border: "none",
                }}
              >
                Submit Code
              </Button>
            </Form>
          </div>
        )}
      </div>
    </>
  );
}

