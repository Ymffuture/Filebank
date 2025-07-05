import React, { useState } from 'react';
import { Form, Input, Select, Rate, Button, Typography, Alert } from 'antd';
import api from '../api/fileApi';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useSnackbar } from 'notistack';

const { Title, Paragraph } = Typography;

export default function FeedbackPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Correct endpoint path
      await api.post('/v0/c/feedback', values);
      enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Feedback submit error:', error);
      enqueueSnackbar('Submission failed. Please try again.', { variant: 'error' });
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
            {/* Consider using Select or Radio.Group for better UX */}
            <Select>
              <Select.Option value="complaint">Complaint</Select.Option>
              <Select.Option value="improvement">Improvement</Select.Option>
            </Select>
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

