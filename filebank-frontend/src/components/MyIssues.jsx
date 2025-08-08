import React, { useState } from "react";
import { Card, List, Button, Empty } from "antd";
import { HelpCircle, MessageCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const MyIssues = () => {
  const [issues] = useState([
    { id: 1, title: "Unable to log in", icon: <AlertTriangle size={20} /> },
    { id: 2, title: "Payment not reflecting", icon: <AlertTriangle size={20} /> },
    { id: 3, title: "File upload failed", icon: <AlertTriangle size={20} /> },
    { id: 4, title: "Slow performance", icon: <AlertTriangle size={20} /> }
  ]);

  const handleContactSupport = () => {
    window.location.href = "/support"; // Or open support chat
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 max-w-2xl mx-auto"
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <HelpCircle size={22} />
            <span>My Issues</span>
          </div>
        }
      >
        {issues.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={issues}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={item.icon}
                  title={<span className="font-semibold">{item.title}</span>}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No common issues found" />
        )}

        <div className="mt-4 text-center">
          <Button
            type="primary"
            icon={<MessageCircle size={18} />}
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default MyIssues;
