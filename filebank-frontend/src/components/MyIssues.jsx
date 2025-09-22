 import React, { useState } from "react";
import { Card, List, Button, Empty, Typography, Tooltip } from "antd";
import { Home, FileText, Activity, HelpCircle, AlertTriangle, Lock, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

const { Paragraph } = Typography;

const Navbar = () => (
  <nav className="bg-[#1F2937] text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
  <div className="flex items-center gap-6">
    <Tooltip title="Home" placement="bottom">
      <a href="/" className="cursor-pointer hover:text-yellow-400 transition">
        <Home size={22} />
      </a>
    </Tooltip>

    <Tooltip title="Dashboard" placement="bottom">
      <a href="/dashboard" className="cursor-pointer hover:text-yellow-400 transition">
        <Activity size={22} />
      </a>
    </Tooltip>

    <Tooltip title="Files" placement="bottom">
      <a href="/files" className="cursor-pointer hover:text-yellow-400 transition">
        <FileText size={22} />
      </a>
    </Tooltip>
  </div>

  <div className="text-sm text-gray-300">
    Contact: <a href="mailto:futurekgomotso@gmail.com" className="hover:underline">futurekgomotso@gmail.com</a> | 063 441 4863
  </div>
</nav>

);

const MyIssues = () => {
  const [issues] = useState([
    { id: 1, title: "Unable to log in", explanation: "Cannot access your account using your credentials." },
    { id: 2, title: "Payment not reflecting", explanation: "Payment completed but the account upgrade did not update." },
    { id: 3, title: "File upload failed", explanation: "Uploading files is unsuccessful due to errors or size limits." },
    { id: 4, title: "Slow performance", explanation: "The app or website is responding slowly." },
    { id: 5, title: "Forgot password", explanation: "Unable to reset your password via the reset link or email." },
    { id: 6, title: "Account locked", explanation: "Account locked due to multiple failed login attempts." },
    { id: 7, title: "Cannot download files", explanation: "Files are not downloading correctly or the download button doesn't work." },
    { id: 8, title: "Incorrect user role", explanation: "User role is not showing correct permissions or access levels." },
    { id: 9, title: "Email not verified", explanation: "Verification email was not received or link expired." },
    { id: 10, title: "Profile update failure", explanation: "Cannot update profile details like name, avatar, or email." }
  ]);

  const blocked = issues.slice(5, 10); // 5 blocked
  const normalIssues = issues.slice(0, 5); // 5 issues

  const handleContactSupport = () => {
    window.location.href = "/support";
  };

  const renderIssueList = (data, title, icon) => (
    <Card
      title={
        <div className="flex items-center gap-2 text-lg font-semibold">
          {icon} <span>{title}</span>
        </div>
      }
      className="mb-6 shadow-lg rounded-lg"
    >
      {data.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item.id * 0.05 }}
            >
              <List.Item>
                <List.Item.Meta
                  avatar={icon}
                  title={<span className="font-medium">{item.title}</span>}
                  description={<Paragraph type="secondary">{item.explanation}</Paragraph>}
                />
              </List.Item>
            </motion.div>
          )}
        />
      ) : (
        <Empty description={`No ${title.toLowerCase()}`} />
      )}
    </Card>
  );

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-4xl mx-auto">
        <SearchBar />

        {/* Normal Issues */}
        {renderIssueList(normalIssues, "Issues", <AlertTriangle size={20} color="#FACC15" />)}
<hr/><br/>
        {/* Blocked / Critical */}
        {renderIssueList(blocked, "Blocked Accounts", <Lock size={20} color="#EF4444" />)}

        {/* Contact Support */}
        <div className="text-center mt-6">
          <Button
            type="primary"
            icon={<MessageCircle size={18} />}
            size="large"
            onClick={handleContactSupport}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </>
  );
};

export default MyIssues;
