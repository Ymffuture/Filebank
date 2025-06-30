import React from 'react';
import { Typography ,Button} from 'antd';
import { Link } from 'react-router-dom';
import { ArrowBigLeftIcon } from 'lucide-react';

const { Title, Paragraph } = Typography;

const ratColors = {
  gold: '#FFD700',
  darkBlue: '#0B3D91',
};

export default function Privacy() {
  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: '0 1rem' }}>
      <Title level={2} style={{ color: ratColors.darkBlue, marginBottom: '1.5rem' }}>
        Privacy Policy
      </Title>

      <Paragraph>
        At FileBank, your privacy is important to us. This policy explains how we collect, use, and protect your personal data.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        1. Information We Collect
      </Title>
      <Paragraph>
        When you register or log in via Google OAuth, we collect your name, email address, and profile picture to personalize your experience.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        2. File Data
      </Title>
      <Paragraph>
        Files you upload are stored securely using encrypted cloud storage. We do not access or share your files without your consent.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        3. Use of Cookies and Tracking
      </Title>
      <Paragraph>
        We use cookies to improve site functionality and analyze usage. No personally identifiable information is collected through cookies.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        4. Data Security
      </Title>
      <Paragraph>
        We implement industry-standard security measures to protect your data against unauthorized access, alteration, or destruction.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        5. Third-Party Services
      </Title>
      <Paragraph>
        FileBank integrates with Google OAuth for authentication and uses cloud providers for file storage. These services have their own privacy policies.
      </Paragraph>

      <Title level={4} style={{ color: ratColors.gold, marginTop: '1.5rem' }}>
        6. Your Rights
      </Title>
      <Paragraph>
        You may update or delete your account and data by contacting support or through the profile settings.
      </Paragraph>

      <Paragraph style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#555' }}>
        Last updated: June 2025
      </Paragraph>

     <div className='flex gap-8'>
         <Link to='/privacy'>
            <Button type='dashed'>
       Terms
      
            </Button>
      
            </Link>
            
      <Link to='/'>
            <Button type='link' icon={<ArrowBigLeftIcon/>}>
       Baaaack
      
            </Button>
      
            </Link>
     </div>
    </div>
  );
}
