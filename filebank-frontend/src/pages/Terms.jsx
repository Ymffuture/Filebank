import React from "react";
import { Typography, Button, Tooltip, message } from "antd";
import { Link } from "react-router-dom";
import {
  Copy,
  FileText,
  UserCircle,
  Lock,
  Shield,
  AlertTriangle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const { Title, Paragraph } = Typography;

const ratColors = {
  gold: "#FFD700",
  darkBlue: "#0B3D91",
  lightGray: "#f9f9f9",
  darkGray: "#202124",
};

const sections = [
  {
    title: "1. Use of Service",
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    content:
      "famacloud allows you to upload, store, and manage your files securely. You agree to use the service only for lawful purposes and not to upload content that violates any laws or infringes rights.",
  },
  {
    title: "2. User Accounts",
    icon: <UserCircle className="w-5 h-5 text-green-600" />,
    content:
      "To use certain features, you must create an account or log in via Google OAuth. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "3. Data and Privacy",
    icon: <Lock className="w-5 h-5 text-red-600" />,
    content:
      "famacloud uses secure cloud storage to keep your files safe. Please review our Privacy Policy for details on how we collect, use, and protect your data.",
  },
  {
    title: "4. Intellectual Property",
    icon: <Shield className="w-5 h-5 text-purple-600" />,
    content:
      "You retain ownership of your uploaded files. By uploading files, you grant famacloud a license to store and display them as necessary to provide the service.",
  },
  {
    title: "5. Limitation of Liability",
    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    content:
      'famacloud is provided "as is" without warranties of any kind. We are not liable for any loss or damage resulting from use of the service.',
  },
  {
    title: "6. Changes to Terms",
    icon: <RefreshCw className="w-5 h-5 text-teal-600" />,
    content:
      "We may update these terms from time to time. Continued use of famacloud after changes constitutes acceptance of the new terms.",
  },
];

export default function Terms() {
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Copied to clipboard!");
    } catch {
      message.error("Failed to copy");
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "3rem auto",
        padding: "2rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <FileText className="w-6 h-6 text-blue-700" />
        <Title
          level={2}
          style={{
            color: ratColors.darkBlue,
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          Terms of Service
        </Title>
      </div>

      <Paragraph style={{ fontSize: "1rem", color: "#444" }}>
        Welcome to <strong>famacloud</strong>. By using our website and
        services, you agree to comply with and be bound by the following terms
        and conditions.
      </Paragraph>

      {sections.map((section, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "2rem",
            padding: "1.2rem",
            borderRadius: "8px",
            background: ratColors.lightGray,
            position: "relative",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {section.icon}
            <Title level={4} style={{ color: ratColors.gold, margin: 0 }}>
              {section.title}
            </Title>
          </div>
          <Paragraph style={{ margin: 0, color: ratColors.darkGray }}>
            {section.content}
          </Paragraph>
          <Tooltip title="Copy section">
            <Button
              type="text"
              icon={<Copy size={16} />}
              onClick={() => handleCopy(`${section.title}\n${section.content}`)}
              style={{ position: "absolute", top: 12, right: 12 }}
            />
          </Tooltip>
        </div>
      ))}

      <Paragraph
        style={{
          marginTop: "2rem",
          fontSize: "0.9rem",
          color: "#555",
          textAlign: "center",
        }}
      >
        <Calendar className="inline w-4 h-4 mr-1 text-gray-600" /> Last updated:
        June 2025
      </Paragraph>

      <div className="flex gap-4 justify-center mt-6">
        <Link to="/privacy">
          <Button type="dashed" size="large" icon={<Lock className="w-4 h-4" />}>
            Privacy Policy
          </Button>
        </Link>
        <Link to="/">
          <Button type="link" size="large" icon={<ArrowLeftIcon className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
 
