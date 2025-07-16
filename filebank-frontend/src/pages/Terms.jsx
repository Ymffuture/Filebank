import React from 'react';
import { Typography, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ratColors = {
  gold: '#FFD700',
  darkBlue: '#0B3D91',
};

export default function Terms() {
  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1rem' }}>
      <Title level={2} style={{ color: ratColors.darkBlue, marginBottom: '1.5rem' }}>
        Terms of Service
      </Title>

      <Paragraph>
        Welcome to famacloud. By using our website and services, you agree to comply with and be bound by the following terms and conditions.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        1. Use of Service
      </Title>
      <Paragraph>
        famacloud allows you to upload, store, and manage your files securely. You agree to use the service only for lawful purposes and not to upload content that violates any laws or infringes rights.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        2. User Accounts
      </Title>
      <Paragraph>
        To use certain features, you must create an account or log in via Google OAuth. You are responsible for maintaining the confidentiality of your account credentials.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        3. Data and Privacy
      </Title>
      <Paragraph>
        famacloud uses secure cloud storage to keep your files safe. Please review our Privacy Policy for details on how we collect, use, and protect your data.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        4. Intellectual Property
      </Title>
      <Paragraph>
        You retain ownership of your uploaded files. By uploading files, you grant famacloud a license to store and display them as necessary to provide the service.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        5. Limitation of Liability
      </Title>
      <Paragraph>
        famacloud is provided "as is" without warranties of any kind. We are not liable for any loss or damage resulting from use of the service.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        6. Changes to Terms
      </Title>
      <Paragraph>
        We may update these terms from time to time. Continued use of famacloud after changes constitutes acceptance of the new terms.
      </Paragraph>

      <Paragraph style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#555' }}>
        Last updated: June 2025
      </Paragraph>

      <Link to="/privacy">
        <Button type="dashed">
          Privacy Policy
        </Button>
      </Link>
    </div>
  );
}

