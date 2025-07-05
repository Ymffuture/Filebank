import React, { useState } from 'react';
import { Form, Input, Select, Rate, Button, Typography, Alert } from 'antd';
import api from '../api/fileApi';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

export default function FeedbackPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (!user?._id) {
        throw new Error('You must be logged in to submit feedback');
      }
      const payload = {
        ...values,
        userId: user._id,
      };
      await api.post('/v0/c/feedback', payload); // Corrected endpoint to match backend
      enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Feedback submit error:', error.response?.data || error.message);
      enqueueSnackbar(
        error.response?.data?.message || 'Submission failed. Please try again.',
        { variant: 'error' }
      );
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
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { max: 100, message: 'Title must be 100 characters or less' },
            ]}
          >
            <Input placeholder="Enter a brief title for your feedback" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Select complaint or improvement' }]}
          >
            <Select>
              <Select.Option value="complaint">Complaint</Select.Option>
              <Select.Option value="improvement">Improvement</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please describe your feedback' },
              { max: 2000, message: 'Description must be 2000 characters or less' },
            ]}
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
