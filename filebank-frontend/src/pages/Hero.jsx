import React from 'react';
import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function Hero() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 text-white p-6 text-center rounded shadow">
      <Title level={1} style={{ color: '#fff' }}>
        Welcome to FileBank
      </Title>
      <Paragraph style={{ fontSize: '1.2rem', maxWidth: 600 }}>
        Securely upload, manage, and access your files anytime, anywhere. Powered by Qurovex technology.
      </Paragraph>

      <div className="flex gap-4 mt-6 flex-wrap justify-center">
        <Link to="/dashboard">
          <Button type="primary" size="large">
            Get Started
          </Button>
        </Link>
        <Link to="/profile">
          <Button type="default" size="large">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
