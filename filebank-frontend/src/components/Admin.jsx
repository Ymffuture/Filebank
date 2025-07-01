import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete user?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="link">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return <Table dataSource={users} columns={columns} rowKey="_id" />;
}

