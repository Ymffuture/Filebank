import React from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { FileOutlined, CloudUploadOutlined, ShieldOutlined, TeamOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';

const { Title, Paragraph, Text } = Typography;

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#E1EEFA]">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <Card
          bordered={false}
          className="shadow-lg rounded-xl"
          style={{ background: '#fff' }}
        >
          <Typography>
            <Title level={2} className="text-center text-[#1E90FF]">About FileBank</Title>
            <Paragraph className="text-center">
              <Text strong>FileBank by Qurovex</Text> is a secure, cloud-powered file management platform.
              We help individuals and teams easily <Text type="success">upload</Text>, <Text type="warning">store</Text>, and <Text type="danger">manage</Text> their documents, images, and media files.
            </Paragraph>
            <Divider />

            <Space size="large" direction="vertical" className="w-full">
              <div className="flex flex-col md:flex-row gap-6">
                <Card
                  bordered={false}
                  className="flex-1 text-center"
                  hoverable
                  style={{ background: '#F0F8FF' }}
                >
                  <CloudUploadOutlined style={{ fontSize: '48px', color: '#1E90FF' }} />
                  <Title level={4}>Simple & Fast Uploads</Title>
                  <Paragraph>Upload any file in seconds. Drag & drop support, PDF, images, and more.</Paragraph>
                </Card>

                <Card
                  bordered={false}
                  className="flex-1 text-center"
                  hoverable
                  style={{ background: '#F0F8FF' }}
                >
                  <ShieldOutlined style={{ fontSize: '48px', color: '#1E90FF' }} />
                  <Title level={4}>Secure & Private</Title>
                  <Paragraph>Your files are encrypted and stored securely using Cloudinary + MongoDB.</Paragraph>
                </Card>

                <Card
                  bordered={false}
                  className="flex-1 text-center"
                  hoverable
                  style={{ background: '#F0F8FF' }}
                >
                  <TeamOutlined style={{ fontSize: '48px', color: '#1E90FF' }} />
                  <Title level={4}>Made for Everyone</Title>
                  <Paragraph>Whether you're an individual or a team, FileBank simplifies your file management.</Paragraph>
                </Card>
              </div>

              <Divider />

              <Title level={4}>Our Mission</Title>
              <Paragraph>
                At <Text strong>FileBank</Text>, we aim to empower users to manage their digital files with ease, speed, and security. 
                Our platform integrates modern technology, a user-friendly interface, and robust security practices to deliver top-tier service.
              </Paragraph>

              <Title level={4}>Contact Us</Title>
              <Paragraph>
                📧 <Text code>quorvexinstitute@gmail.com</Text><br/>
                📍 2354 Drieziek 4, Orange Farm, Johannesburg South, 1841<br/>
                🌐 <a href="https://filebank.vercel.app" target="_blank" rel="noopener noreferrer">filebank.vercel.app</a>
              </Paragraph>
            </Space>
          </Typography>
        </Card>
      </main>
    </div>
  );
}

