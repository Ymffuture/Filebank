import React, { useState } from 'react';
import { Form, Input, Rate, Button, Typography, Alert, message } from 'antd';
import api from '../api/fileApi';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

const { Title, Paragraph } = Typography;

export default function FeedbackPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await api.post('v0/c/feedback', values);
      message.success('Thank you for your feedback!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      message.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient-to-tr from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <Title level={2} className="text-center text-[#1E90FF] mb-4">
          File a Complaint or Improvement
        </Title>
        <Paragraph className="text-center text-gray-600 mb-6">
          Share your thoughts and rate our service to help us improve.
        </Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: 'complaint', rating: 0 }}
        >
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Select complaint or improvement' }]}
          >
            <Input.Group compact>
              <Form.Item name="type" noStyle>
                <Button.Group>
                  <Button type="default" htmlType="button" onClick={() => {}}>
                    Complaint
                  </Button>
                  <Button type="default" htmlType="button" onClick={() => {}}>
                    Improvement
                  </Button>
                </Button.Group>
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please describe your feedback' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter details here..." />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rate our service"
            rules={[{ required: true, message: 'Please rate us' }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<Star />}
              loading={submitting}
              style={{ backgroundColor: '#1E90FF', borderColor: '#1E90FF' }}
            >
              Submit Feedback
            </Button>
          </Form.Item>
        </Form>

        <Alert
          type="info"
          showIcon
          className="mt-4"
          message="All feedback is anonymized and helps us secure and improve the platform."
        />
      </div>
    </div>
  );
}

