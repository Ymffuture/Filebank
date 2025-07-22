import React, { useState } from 'react';
import { Select, Button, message, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const RoleUpdater = ({ userId, currentRole }) => {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/users/${userId}/role`, { role });
      message.success(response.data.message);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update role';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Select
        value={role}
        onChange={setRole}
        style={{ width: 150 }}
        disabled={loading}
      >
        <Option value="user">User</Option>
        <Option value="admin">Admin</Option>
      </Select>

      <Button
        type="primary"
        onClick={handleRoleChange}
        disabled={currentRole === role}
        loading={loading}
      >
        Update Role
      </Button>
    </div>
  );
};

export default RoleUpdater;

