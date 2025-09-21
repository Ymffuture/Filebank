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
  Steps,
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
const { Step } = Steps;

const PlanFeature = ({ enabled, label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    {enabled ? (
      <Check className="text-green-600 w-4 h-4" />
    ) : (
      <X className="text-red-500 w-4 h-4" />
    )}
    <span>{label}</span>
  </div>
);

const planFeatures = {
  free: {
    upload: true,
    support: true,
    share: true,
    autoDelete: true,
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
  { name: "Free", price: "R0", description: "Basic access", role: "free" },
  {
    name: "Standard",
    price: "R39 Once",
    description: "CV + Cover Letter help",
    role: "standard",
  },
  {
    name: "Premium",
    price: "R59 Once",
    description: "AI assistant + early features",
    role: "premium",
    best:true, 
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
      console.error(err);
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
        step: 0,
      },
      approved: {
        text: "Plan Approved",
        icon: <ThumbsUp className="text-green-600 w-4 h-4" />,
        color: "green",
        step: 1,
      },
      rejected: {
        text: "Rejected by Famacloud",
        icon: <ThumbsDown className="text-red-500 w-4 h-4" />,
        color: "red",
        step: 0,
      },
    };

    const current = statusMap[upgradeStatus];

    return (
      <div className="flex flex-col items-center justify-center mt-4 gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
            upgradeStatus === "pending"
              ? "bg-yellow-100 text-yellow-700 animate-pulse"
              : upgradeStatus === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {current.icon}
          {current.text}
        </div>

        <Steps
          size="small"
          current={current.step}
          status={upgradeStatus === "rejected" ? "error" : "process"}
          className="w-full max-w-sm"
        >
          <Step title="Pending" />
          <Step title="Approved" />
          <Step title="Active" />
        </Steps>

        {statusData?.createdAt && (
          <Text type="secondary" className="text-xs">
            Submitted {dayjs(statusData.createdAt).fromNow()}
          </Text>
        )}
        {upgradeStatus === "rejected" && statusData?.rejectionReason && (
          <Paragraph type="danger" className="text-red-600 text-xs">
            <b>Reason</b>: {statusData.rejectionReason}
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
        console.warn("No upgrade status found:", err);
      }
    };
    fetchStatus();
  }, [user?._id]);

  return (
    <>
      <Navbar />

      <Helmet>
        <title>Change plan | best-selling R39</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#fff] via-[#202124] to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            
            <Title level={3} style={{ marginBottom: 0, color: "#fff" }}>
              🔥 Best pricing board
            </Title>
            <div />
          </div>

          <div className="bg-gradient-to-r from-[#202124] to-[#1677ff] text-white py-12 text-center mt-2">
        <Title level={2} style={{ color: "#fff" }}>
          💎 Upgrade Your Famacloud Experience
        </Title>
        <Paragraph style={{ color: "#eee" }}>
          Choose the best plan for you — from Free to Premium AI-powered tools.
        </Paragraph>
      </div>

          <Row gutter={[24, 24]} justify="center">
            {plans.map((plan) => {
              const features = planFeatures[plan.role];
              const isCurrent = user?.role === plan.role;
              const isSelected = selectedPlan?.role === plan.role;

              return (
                <Col xs={24} sm={12} md={8} key={plan.name}>
                  <Card
                    title={
                      <Text strong className="text-lg text-[#202124]">
                        {plan.name}
                      </Text>
                      <Text>
                      {plan.best && (
                        <Tag color="green" className="font-bold shadow">
                          Recommended
                        </Tag>
                      )}
                      </Text>
                      
                    }
                    bordered={false}
                    className={`transition-all duration-300 rounded-xl shadow-md hover:shadow-xl p-2 ${
                      isSelected ? "ring-2 ring-[#a52a2a]" : "border"
                    }`}
                    style={{
                      textAlign: "center",
                      background: "linear-gradient(135deg, #fff, #f9f9f9)",
                    }}
                    actions={[
                      <Button
                        type={isCurrent ? "default" : "primary"}
                        block
                        size="large"
                        disabled={isCurrent}
                        className={`rounded-lg font-semibold m-3 p-3 ${
                          isCurrent
                            ? "bg-gray-100 text-gray-500"
                            : "bg-[#202124] hover:bg-[#7a1e1e] text-white shadow-md"
                        }`}
                        onClick={() => !isCurrent && handleChoosePlan(plan)}
                      >
                        {isCurrent ? "✔ Current Plan" : "✨ Choose Plan"}
                      </Button>,
                    ]}
                  >
                    <Title
                      level={2}
                      className="font-bold"
                      style={{
                        color: isSelected ? "#a52a2a" : "#202124",
                      }}
                    >
                      {plan.price}
                    </Title>
                    <Paragraph className="text-gray-600">
                      {plan.description}
                    </Paragraph>

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
                        label="Auto delete after 90 days"
                      />
                      <PlanFeature
                        enabled={features.ai}
                        label="AI Assistant"
                      />
                      <PlanFeature
                        enabled={features.cv}
                        label="CV & Cover Letter"
                      />
                      <PlanFeature
                        enabled={features.agents}
                        label="CV Agents"
                      />
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

          {selectedPlan && upgradeStatus !== "approved" && (
            <div className="mt-10 max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <Title level={4} style={{ color: "#333" }}>
                What’s Next for the {selectedPlan.name} Plan
              </Title>
              <Paragraph>
                After sending the WhatsApp message, return here and paste your
                transaction code. The code will be verified by Famacloud.
              </Paragraph>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                <li>
                  <strong>Pending:</strong> Waiting for Famacloud confirmation
                </li>
                <li>
                  <strong>Approved:</strong> Your plan is active
                </li>
                <li>
                  <strong>Rejected:</strong> Code invalid or payment issue
                </li>
              </ul>

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
                  <Input placeholder="e.g. 45TRJ970" />
                </Form.Item>
                <Button
                  type="dashed"
                  htmlType="submit"
                  loading={loading}
                  block
                  disabled={loading}
                >
                  Submit the code
                </Button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
