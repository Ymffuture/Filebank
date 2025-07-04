import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton, Alert, Badge } from 'antd';
import api from '../api/fileApi';
import { Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileZipOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  CodeOutlined,
  FileOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { ArrowBigLeftDashIcon } from 'lucide-react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const getAgeInDays = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const getRelativeTime = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffSec = Math.floor((now - created) / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/files');
      const data = res.data;
      setFiles(data);

      // Auto-delete files older than 30 days
      const deletionPromises = data
        .filter(file => getAgeInDays(file.createdAt) >= 30)
        .map(file => handleDelete(file.slug));
      await Promise.all(deletionPromises);
    } catch (err) {
      console.error('Error fetching files:', err);
      enqueueSnackbar('Failed to load files', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleDelete = async (slug) => {
    setDeleting(slug);
    try {
      await api.delete(`/files/${slug}`);
      enqueueSnackbar('File deleted', { variant: 'success' });
      setRefresh(prev => prev + 1);
    } catch (err) {
      console.error(`Error deleting file ${slug}:`, err);
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (file) => {
    // ...your optimized icon logic...
  };

  return (
    <>
      {location.pathname === '/files' && (
        <div className="p-4 sticky top-0 z-50 bg-white">
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowBigLeftDashIcon />} className="mt-8 mb-8">
              Baaaack
            </Button>
          </Link>
        </div>
      )}

      <Alert
        message="Tip: Before downloading, rename files like gdyD6-my-cvpdf to something meaningful (e.g., MyCv.pdf) so you can easily find them later."
        type="warning"
        showIcon
        closable
        className="mb-4"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} hoverable bodyStyle={{ minHeight: 200 }}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))
        ) : files.length > 0 ? (
          files.map((file) => {
            const ageDays = getAgeInDays(file.createdAt);
            const relative = getRelativeTime(file.createdAt);
            const downloadUrl = file.downloadUrl || `${file.url}?fl=attachment:${encodeURIComponent(file.filename)}`;

            return (
              <Card
                key={file._id}
                title={
                  <Space>
                    {getFileIcon(file)}
                    <Tooltip title={file.slug}>
                      {file.filename.length > 20 ? file.filename.slice(0, 20) + '...' : file.filename}
                    </Tooltip>
                    {ageDays <= 2 && <Badge count="New" style={{ backgroundColor: '#52c41a' }} />}
                  </Space>
                }
                actions={[
                  <a href={downloadUrl} download={file.filename} key="download" target="_blank" rel="noopener noreferrer">
                    <DownloadOutlined /> Download
                  </a>,
                  <Popconfirm
                    title="Are you sure to delete this file?"
                    onConfirm={() => handleDelete(file.slug)}
                    okText="Yes"
                    cancelText="No"
                    key="delete"
                    disabled={deleting === file.slug}
                  >
                    <Button danger type="text" icon={<DeleteOutlined />} loading={deleting === file.slug}>
                      Delete
                    </Button>
                  </Popconfirm>
                ]}
                hoverable
                bodyStyle={{ minHeight: 200 }}
              >
                <p className="text-gray-700 p-1 rounded">
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  <strong>Uploaded:</strong> {relative}
                </p>

                {ageDays > 0 && ageDays < 30 && (
                  <Alert
                    message={`Will be deleted in ${30 - ageDays} days for security purposes`}
                    type="warning"
                    showIcon
                    className="mb-2"
                  />
                )}

                {/* ...rest of your preview logic */}
              </Card>
            );
          })
        ) : (
          <Card hoverable className="text-center text-gray-400" bodyStyle={{ minHeight: 200 }}>
            <p className="text-lg text-gray-400">No files uploaded yet. Start by uploading your first file!</p>
          </Card>
        )}
      </div>
    </>
  );
}

