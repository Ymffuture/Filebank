import React, { useEffect, useState } from 'react';
import { Card, Button, Space, message, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined, DownloadOutlined, FileOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { ArrowBigLeftDashIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FileList() {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load files');
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
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

  // Utility to format date & time nicely
  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Utility to detect file type
  const getFileType = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  return (

    <>
    <Button primary type="link" icon={<ArrowBigLeftDashIcon/>} className='mt-8 mb-18'>
                <Link to='/dashboard'>
                Baaaack
                </Link>
                </Button>
    
    
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
      {files.map((file) => {
        const fileType = getFileType(file.url);
        return (
          <Card
            key={file._id}
            title={
              <Tooltip title={file.filename}>
                <Space>
                  {fileType === 'image' && <FileImageOutlined />}
                  {fileType === 'pdf' && <FilePdfOutlined />}
                  {fileType === 'other' && <FileOutlined />}
                  {file.filename.length > 20 ? file.filename.slice(0, 20) + '...' : file.filename}
                </Space>
              </Tooltip>
            }
            actions={[
              <a href={file.url} target="_blank" rel="noopener noreferrer" key="download">
                <DownloadOutlined /> Download
              </a>,
              <Popconfirm
                title="Are you sure to delete this file?"
                onConfirm={() => handleDelete(file.slug)}
                okText="Yes"
                cancelText="No"
                key="delete"
              >
                <Button danger type="text" icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            ]}
            hoverable
            bodyStyle={{ minHeight: 200 }}
          >
            <p><strong>Uploaded by:</strong> {file.userId || 'N/A'}</p>
            <p><strong>Uploaded on:</strong> {file.createdAt ? formatDateTime(file.createdAt) : 'Unknown'}</p>

            {/* Preview section */}
            {fileType === 'image' && (
              <img
                src={file.url}
                alt={file.filename}
                style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, borderRadius: 8 }}
              />
            )}

            {fileType === 'pdf' && (
              <iframe
                src={file.url}
                title={file.filename}
                width="100%"
                height="150"
                style={{ marginTop: 8, borderRadius: 8, border: '1px solid #ddd' }}
              />
            )}

            {fileType === 'other' && (
              <div
                style={{
                  marginTop: 8,
                  height: 150,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  color: '#999',
                  fontSize: 48,
                }}
              >
                <FileOutlined />
              </div>
            )}
          </Card>
        );
      })}
    </div>
    </>
  );
}
