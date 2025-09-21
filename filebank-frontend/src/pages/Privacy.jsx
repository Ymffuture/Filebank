import React from "react";
import { Typography, Button, Tooltip, message } from "antd";
import { Link } from "react-router-dom";
import {
  Copy,
  ShieldCheck,
  Lock,
  FileText,
  Cookie,
  Database,
  UserCheck,
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
    title: "1. Information We Collect",
    icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    content:
      "When you register or log in via Google OAuth, we collect your name, email address, and profile picture to personalize your experience.",
  },
  {
    title: "2. File Data",
    icon: <FileText className="w-5 h-5 text-green-600" />,
    content:
      "Files you upload are stored securely using encrypted cloud storage. We do not access or share your files without your consent.",
  },
  {
    title: "3. Use of Cookies and Tracking",
    icon: <Cookie className="w-5 h-5 text-yellow-600" />,
    content:
      "We use cookies to improve site functionality and analyze usage. No personally identifiable information is collected through cookies.",
  },
  {
    title: "4. Data Security",
    icon: <Lock className="w-5 h-5 text-red-600" />,
    content:
      "We implement industry-standard security measures to protect your data against unauthorized access, alteration, or destruction.",
  },
  {
    title: "5. Third-Party Services",
    icon: <Database className="w-5 h-5 text-purple-600" />,
    content:
      "famacloud integrates with Google OAuth for authentication and uses cloud providers for file storage. These services have their own privacy policies.",
  },
  {
    title: "6. Your Rights",
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    content:
      "You may update or delete your account and data by contacting support or through the profile settings.",
  },
];

export default function Privacy() {
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
        <ShieldCheck className="w-6 h-6 text-teal-700" />
        <Title
          level={2}
          style={{
            color: ratColors.darkBlue,
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          Privacy Policy
        </Title>
      </div>

      <Paragraph style={{ fontSize: "1rem", color: "#444" }}>
        At <strong>famacloud</strong>, your privacy is important to us. This
        policy explains how we collect, use, and protect your personal data.
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
        <Link to="/terms">
          <Button
            type="dashed"
            size="large"
            icon={<FileText className="w-4 h-4" />}
          >
            Terms & Conditions
          </Button>
        </Link>

        <Link to="/">
          <Button
            type="link"
            size="large"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

