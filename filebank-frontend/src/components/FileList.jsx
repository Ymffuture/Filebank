import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton } from 'antd';
import { DeleteOutlined, DownloadOutlined, FileOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { ArrowBigLeftDashIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track deleting state for each file
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/files');
      setFiles(res.data);
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
  }, []);

  const handleDelete = async (slug) => {
    setDeleting(slug); // Set deleting state
    try {
      await api.delete(`files/${slug}`);
      enqueueSnackbar('File deleted', { variant: 'success' });
      fetchFiles();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getFileType = (url) => {
  const ext = url.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'].includes(ext)) {
    return 'image';
  }

  if (['pdf'].includes(ext)) {
    return 'pdf';
  }

  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
    return 'word';
  }

  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
    return 'excel';
  }

  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return 'powerpoint';
  }

  if (['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'log'].includes(ext)) {
    return 'text';
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }

  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }

  if (['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'].includes(ext)) {
    return 'video';
  }

  if (['html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'c', 'cpp', 'rb', 'go', 'rs'].includes(ext)) {
    return 'code';
  }

  return 'other';
};


  return (
    <>
      {location.pathname === '/files' && (
        <div className="p-4">
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowBigLeftDashIcon />} className="mt-8 mb-8">
              Baaaack
            </Button>
          </Link>
        </div>
      )}

<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded p-3 mb-4 text-sm">
  <strong>Tip:</strong> After downloading, rename files like <code>uiey3653jvbsksvak.pdf</code> to something meaningful (e.g., <code>MyCv.pdf</code>) so you can easily find them later.
</div>

      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} hoverable bodyStyle={{ minHeight: 200 }}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))
        ) : files.length > 0 ? (
          files.map((file) => {
            const fileType = getFileType(file.url);
            // Use downloadUrl if available, otherwise append ?fl=attachment for PDFs
            const downloadUrl = file.downloadUrl || `${file.url}?fl=attachment`;


            return (
              <Card
                key={file._id}
                title={
                  <Tooltip title={file.slug}>
                    <Space>
                      {fileType === 'image' && <FileImageOutlined />}
{fileType === 'pdf' && <FilePdfOutlined />}
{fileType === 'word' && <FileOutlined />}
{fileType === 'excel' && <FileOutlined />}
{fileType === 'powerpoint' && <FileOutlined />}
{fileType === 'text' && <FileOutlined />}
{fileType === 'archive' && <FileOutlined />}
{fileType === 'audio' && <FileOutlined />}
{fileType === 'video' && <FileOutlined />}
{fileType === 'code' && <FileOutlined />}
{fileType === 'other' && <FileOutlined />}

                      {file.filename.length > 20 ? file.filename.slice(0, 20) + '...' : file.filename}
                      <span className="text-gray-400 text-xs">({file.slug})</span>
                    </Space>
                  </Tooltip>
                }
                actions={[
                  <a href={downloadUrl} download={file.filename} key="download">
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
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      loading={deleting === file.slug}
                    >
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
                hoverable
                bodyStyle={{ minHeight: 200 }}
              >
                <p className="text-white bg-[green] p-1 rounded">
                  <strong>Uploaded on:</strong> {file.createdAt ? formatDateTime(file.createdAt) : 'Unknown'}
                </p>

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
                <p className="text-[gray] p-2">{file.slug} <span className='text-[red] font-semibold bg-black p-1 rounded'>upload:{file.fileCount}</span></p>
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
