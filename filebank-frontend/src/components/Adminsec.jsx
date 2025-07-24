import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import api from '../api/fileApi';

export default function AdminUpgradeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/payment-requests');
      setRequests(data);
    } catch (err) {
      message.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      await api.post(`/admin/payment-requests/${id}/approve`);
      message.success('User upgraded successfully');
      fetchRequests();
    } catch (err) {
      message.error('Approval failed');
    }
  };

  const columns = [
    { title: 'User Email', dataIndex: 'email', key: 'email' },
    { title: 'Plan', dataIndex: 'plan', key: 'plan' },
    { title: 'Code', dataIndex: 'paymentCode', key: 'paymentCode' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
        }[status] || 'gray';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Button type="primary" onClick={() => approveRequest(record._id)}>
            Approve
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Upgrade Requests</h2>
      <Table
        dataSource={requests}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}

