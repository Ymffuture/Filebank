import React, { useEffect, useState } from 'react';
import { Card, Button, Space, message, Popconfirm } from 'antd';
import { DeleteOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

export default function FileList() {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load files');
    }
  };
  
useEffect(() => {
  fetchFiles();
  const interval = setInterval(fetchFiles, 5000); // every 5 seconds
  return () => clearInterval(interval);
}, []);

  const handleDelete = async (slug) => {
    try {
      await api.delete(`/${slug}`);
      message.success('File deleted');
      fetchFiles();
    } catch (err) {
      console.error(err);
      message.error('Delete failed');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      {files.map((file) => (
        <Card
          key={file._id}
          title={
            <Space>
              <FileOutlined /> {file.filename}
            </Space>
          }
          actions={[
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <DownloadOutlined /> Download
            </a>,
            <Popconfirm
              title="Are you sure to delete this file?"
              onConfirm={() => handleDelete(file.slug)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="text" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          ]}
          hoverable
        >
          <p><strong>Uploaded by:</strong> {file.userId || 'N/A'}</p>
          <p><strong>URL:</strong> <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">View</a></p>
        </Card>
      ))}
    </div>
  );
}
