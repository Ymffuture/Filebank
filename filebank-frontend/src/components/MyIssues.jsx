 import React, { useState } from "react";
import { Card, List, Button, Empty, Typography, Badge } from "antd";
import { HelpCircle, MessageCircle, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

const { Paragraph } = Typography;

const MyIssues = () => {
  // Example blocked users and issues (5 each)
  const [blockedUsers] = useState([
    { id: 1, name: "User A", reason: "Multiple failed login attempts" },
    { id: 2, name: "User B", reason: "Policy violation" },
    { id: 3, name: "User C", reason: "Suspicious activity" },
    { id: 4, name: "User D", reason: "Payment issue" },
    { id: 5, name: "User E", reason: "Account suspended" },
  ]);

  const [issues] = useState([
    { id: 1, title: "Unable to log in", explanation: "Cannot access account using credentials." },
    { id: 2, title: "Payment not reflecting", explanation: "Payment completed but account not upgraded." },
    { id: 3, title: "File upload failed", explanation: "Uploading files unsuccessful due to errors." },
    { id: 4, title: "Slow performance", explanation: "App responds slowly or lags." },
    { id: 5, title: "Forgot password", explanation: "Cannot reset password via link or email." },
  ]);

  const handleContactSupport = () => {
    window.location.href = "/support";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">MyApp</div>
          <div className="flex gap-6">
            <a href="/" className="hover:text-blue-500">Home</a>
            <a href="/dashboard" className="hover:text-blue-500">Dashboard</a>
            <a href="/files" className="hover:text-blue-500">Files</a>
          </div>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 max-w-5xl mx-auto space-y-8"
      >
        {/* Blocked Users */}
        <Card
          title={
            <div className="flex items-center gap-2 text-red-600">
              <Lock size={22} />
              <span>Blocked Accounts</span>
            </div>
          }
          bordered
        >
          {blockedUsers.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={blockedUsers}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Badge status="error" />}
                    title={<span className="font-semibold">{item.name}</span>}
                    description={<Paragraph type="secondary">{item.reason}</Paragraph>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No blocked accounts" />
          )}
        </Card>

        {/* Issues */}
        <Card
          title={
            <div className="flex items-center gap-2 text-yellow-500">
              <HelpCircle size={22} />
              <span>Account Issues</span>
            </div>
          }
          bordered
        >
          {issues.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={issues}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<AlertTriangle size={20} />}
                    title={<span className="font-semibold">{item.title}</span>}
                    description={<Paragraph type="secondary">{item.explanation}</Paragraph>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No issues found" />
          )}

          <div className="mt-6 text-center">
            <Button
              type="primary"
              icon={<MessageCircle size={18} />}
              onClick={handleContactSupport}
            >
              Contact Support
            </Button>
          </div>
        </Card>

        {/* Search */}
        <SearchBar />
      </motion.div>
    </div>
  );
};

export default MyIssues;

