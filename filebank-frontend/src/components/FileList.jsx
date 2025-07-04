import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton, Alert, Badge } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
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
  DownloadOutlined
} from '@ant-design/icons';
import { ArrowBigLeftDashIcon } from 'lucide-react';

dayjs.extend(relativeTime);

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/files');
      const data: FileItem[] = res.data;
      setFiles(data);
      // Auto-delete files older than 30 days
      data.forEach(file => {
        const age = dayjs().diff(dayjs(file.createdAt), 'day');
        if (age >= 30) {
          handleDelete(file.slug);
        }
      });
    } catch (err) {
      console.error(err);
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

  const handleDelete = async (slug: string) => {
    setDeleting(slug);
    try {
      await api.delete(`files/${slug}`);
      enqueueSnackbar('File deleted', { variant: 'success' });
      setRefresh(prev => prev + 1);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const formatDateTime = (dateString: string) => dayjs(dateString).format('YYYY-MM-DD HH:mm');

  const getFileIcon = (file: FileItem) => {
    const ext = file.url.split('.').pop()?.toLowerCase() || '';
    switch (file.resourceType) {
      case 'image': return <FileImageOutlined />;
      case 'video': return <VideoCameraOutlined />;
      case 'audio': return <AudioOutlined />;
      case 'raw':
        if (['pdf'].includes(ext)) return <FilePdfOutlined />;
        if (['doc','docx','odt','rtf'].includes(ext)) return <FileWordOutlined />;
        if (['xls','xlsx','ods','csv'].includes(ext)) return <FileExcelOutlined />;
        if (['ppt','pptx','odp'].includes(ext)) return <FilePptOutlined />;
        if (['txt','md','json','xml','yaml','yml','log'].includes(ext)) return <FileTextOutlined />;
        if (['zip','rar','7z','tar','gz'].includes(ext)) return <FileZipOutlined />;
        if (['html','css','js','ts','php','py'].includes(ext)) return <CodeOutlined />;
        return <FileOutlined />;
      default:
        if (['jpg','jpeg','png','gif','bmp','webp','svg'].includes(ext)) return <FileImageOutlined />;
        if (['mp4','mov','avi','mkv'].includes(ext)) return <VideoCameraOutlined />;
        if (['mp3','wav','ogg'].includes(ext)) return <AudioOutlined />;
        if (['pdf'].includes(ext)) return <FilePdfOutlined />;
        if (['doc','docx'].includes(ext)) return <FileWordOutlined />;
        if (['xls','xlsx','csv'].includes(ext)) return <FileExcelOutlined />;
        if (['ppt','pptx'].includes(ext)) return <FilePptOutlined />;
        if (['txt','md'].includes(ext)) return <FileTextOutlined />;
        if (['zip','rar'].includes(ext)) return <FileZipOutlined />;
        if (['js','py','java','c','cpp'].includes(ext)) return <CodeOutlined />;
        return <FileOutlined />;
    }
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
            const downloadUrl = file.downloadUrl || `${file.url}?fl=attachment:${encodeURIComponent(file.filename)}`;
            const ageDays = dayjs().diff(dayjs(file.createdAt), 'day');
            const relative = dayjs(file.createdAt).fromNow();

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

                {/* File preview/rendering */}
                {file.resourceType === 'image' && (
                  <img
                    src={file.url}
                    alt={file.filename}
                    style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, borderRadius: 8 }}
                  />
                )}

                {file.resourceType === 'raw' && file.filename.split('.').pop().toLowerCase() === 'pdf' && (
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    <FilePdfOutlined style={{ fontSize: 80, color: '#999' }} />
                    <p>Click to view or download</p>
                  </a>
                )}

                {file.resourceType !== 'image' && !['pdf'].includes(file.filename.split('.').pop().toLowerCase()) && (
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
                    {getFileIcon(file)}
                  </div>
                )}

                <p className="text-[gray] p-2 underline">@{file.slug}</p>
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

