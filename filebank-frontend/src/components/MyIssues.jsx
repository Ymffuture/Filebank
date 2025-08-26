import React, { useState } from "react";
import { Card, List, Button, Empty, Typography } from "antd";
import { HelpCircle, MessageCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import search from './SearchLink' ;
const { Paragraph } = Typography;

const MyIssues = () => {
  const [issues] = useState([
    { id: 1, title: "Unable to log in", explanation: "Cannot access your account using your credentials." },
    { id: 2, title: "Payment not reflecting", explanation: "Payment completed but the account upgrade or purchase did not update." },
    { id: 3, title: "File upload failed", explanation: "Uploading files is unsuccessful due to errors or size limits." },
    { id: 4, title: "Slow performance", explanation: "The app or website is responding slowly or lagging." },
    { id: 5, title: "Forgot password", explanation: "Unable to reset your password via the reset link or email." },
    { id: 6, title: "Account locked", explanation: "Account locked due to multiple failed login attempts." },
    { id: 7, title: "Cannot download files", explanation: "Files are not downloading correctly or the download button doesn't work." },
    { id: 8, title: "Incorrect user role", explanation: "User role is not showing correct permissions or access levels." },
    { id: 9, title: "Email not verified", explanation: "Verification email was not received or link expired." },
    { id: 10, title: "Profile update failure", explanation: "Cannot update profile details like name, avatar, or email." },
    { id: 11, title: "Two-factor authentication issues", explanation: "Problems enabling or using 2FA on your account." },
    { id: 12, title: "Subscription cancellation", explanation: "Unable to cancel or modify your subscription plan." },
    { id: 13, title: "Invoice or billing issues", explanation: "Discrepancies or questions about invoices or billing." },
    { id: 14, title: "App crashes", explanation: "Application crashes or closes unexpectedly during use." },
    { id: 15, title: "Notifications not received", explanation: "Push or email notifications are not being received." },
    { id: 16, title: "Search functionality not working", explanation: "Search bar returns no results or errors." },
    { id: 17, title: "Data export failure", explanation: "Unable to export your data or reports." },
    { id: 18, title: "Wrong data displayed", explanation: "Information on your dashboard or files is incorrect." },
    { id: 19, title: "App not compatible", explanation: "Device or browser compatibility issues." },
    { id: 20, title: "Session timeout too short", explanation: "Logged out too quickly due to session expiry." },
    { id: 21, title: "Link sharing issues", explanation: "Shared links to files or documents do not work." },
    { id: 22, title: "Account deletion request", explanation: "Need assistance with deleting your account." },
    { id: 23, title: "Multi-device sync problem", explanation: "Data not syncing correctly across devices." },
    { id: 24, title: "Language or localization issue", explanation: "Incorrect language or region settings." },
    { id: 25, title: "Payment method declined", explanation: "Card or payment method is being declined." },
    { id: 26, title: "Security concern", explanation: "Suspicious activity noticed on your account." },
    { id: 27, title: "API access problem", explanation: "Issues with using our API services." },
    { id: 28, title: "Account merge request", explanation: "Need to merge multiple accounts into one." },
    { id: 29, title: "Unable to upload specific file types", explanation: "Some file formats are not accepted or fail to upload." },
    { id: 30, title: "Avatar image not updating", explanation: "Profile picture does not change after upload." },
    { id: 31, title: "Billing address error", explanation: "Billing address details are incorrect or not saving." },
    { id: 32, title: "Subscription renewal problem", explanation: "Subscription did not renew or was charged incorrectly." },
    { id: 33, title: "Trial period issues", explanation: "Trial period not activated or expired too soon." },
    { id: 34, title: "Email spam filtering", explanation: "Our emails are going to spam/junk folder." },
    { id: 35, title: "User permissions incorrect", explanation: "Unable to access features allowed for your role." },
    { id: 36, title: "Feedback submission failure", explanation: "Feedback form doesn't submit or shows errors." },
    { id: 37, title: "Mobile app login issues", explanation: "Problems logging in through the mobile app." },
    { id: 38, title: "Desktop app crashes", explanation: "The desktop client crashes or won’t open." },
    { id: 39, title: "Cannot reset 2FA", explanation: "Issues resetting two-factor authentication." },
    { id: 40, title: "Password complexity requirement", explanation: "Password change rejected due to complexity rules." },
    { id: 41, title: "File sharing permission errors", explanation: "Shared files are inaccessible or permission errors occur." },
    { id: 42, title: "Account suspended", explanation: "Account suspended due to policy violations." },
    { id: 43, title: "Browser cache problems", explanation: "Old data shown because of browser caching." },
    { id: 44, title: "Unable to download invoices", explanation: "Invoices are not available for download." },
    { id: 45, title: "Email change request", explanation: "Unable to change your email address." },
    { id: 46, title: "Feature request", explanation: "Want to suggest a new feature or improvement." },
    { id: 47, title: "Two accounts conflict", explanation: "Issues caused by having two accounts with same email." },
    { id: 48, title: "Data privacy concerns", explanation: "Questions about how your data is used or stored." },
    { id: 49, title: "Mobile notifications disabled", explanation: "Not receiving notifications on mobile devices." },
    { id: 50, title: "App update failure", explanation: "Application update fails to install." },
    { id: 51, title: "Third-party integration problems", explanation: "Issues connecting to other services or apps." },
    { id: 52, title: "Account recovery problem", explanation: "Unable to recover a lost or hacked account." },
    { id: 53, title: "Content upload restrictions", explanation: "Certain content blocked due to policy restrictions." },
    { id: 54, title: "Storage limit exceeded", explanation: "Reached maximum allowed storage space." },
    { id: 55, title: "Error 500 server error", explanation: "Unexpected internal server error." },
    { id: 56, title: "UI glitches", explanation: "Visual bugs or layout problems in the app." },
    { id: 57, title: "Login session expired", explanation: "Session expires too soon while logged in." },
    { id: 58, title: "Cannot delete account", explanation: "Account deletion process not working." },
    { id: 59, title: "Incorrect billing cycle", explanation: "Billing dates or cycles are incorrect." },
    { id: 60, title: "Password reset email delay", explanation: "Password reset email is delayed or missing." },
    { id: 61, title: "Unwanted notifications", explanation: "Receiving too many notifications or spam." },
    { id: 62, title: "API rate limit exceeded", explanation: "Too many requests to API, blocked temporarily." },
    { id: 63, title: "Custom branding issues", explanation: "Problems applying custom branding or themes." },
    { id: 64, title: "File preview not working", explanation: "Cannot preview files inside the app." },
    { id: 65, title: "Data import failure", explanation: "Unable to import data from external sources." },
    { id: 66, title: "In-app chat not working", explanation: "Messaging feature within the app is broken." },
    { id: 67, title: "Multiple login sessions", explanation: "Issues managing concurrent logins from different devices." },
    { id: 68, title: "Account upgrade failed", explanation: "Upgrade to premium or other plans failed." }
  ]);

  const handleContactSupport = () => {
    window.location.href = "/support"; // Or open support chat, WhatsApp link etc.
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 max-w-3xl mx-auto"
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
          <Empty description="No common issues found" />
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
      <search />
    </motion.div>
  );
};

export default MyIssues;
 
