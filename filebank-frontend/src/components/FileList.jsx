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
  DownloadOutlined,
  CopyOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  LinkedinOutlined
} from '@ant-design/icons';
import { ArrowBigLeftDashIcon } from 'lucide-react';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [time, setTime] = useState(Date.now());
  const [displayCount, setDisplayCount] = useState(4);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const getAgeInDays = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  const getRelativeTime = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const diffSec = Math.floor((new Date() - created) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files');
      console.log('Fetched files:', data);
      data.forEach(file => {
        console.log(`File ${file.slug}: createdAt=${file.createdAt}, age=${getAgeInDays(file.createdAt)} days`);
      });
      const toDelete = data.filter(f => getAgeInDays(f.createdAt) >= 30);
      console.log('Files to delete:', toDelete);
      await Promise.all(toDelete.map(f => handleDelete(f.slug)));
      setFiles(data.filter(f => getAgeInDays(f.createdAt) < 30));
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load files', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (slug) => {
    setDeleting(slug);
    try {
      await api.delete(`/files/${slug}`);
      enqueueSnackbar('File deleted', { variant: 'success' });
      setRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (file) => {
    const ext = (file.url.split('.').pop() || '').toLowerCase();
    const iconMap = {
      image: FileImageOutlined,
      video: VideoCameraOutlined,
      audio: AudioOutlined,
      pdf: FilePdfOutlined,
      word: FileWordOutlined,
      excel: FileExcelOutlined,
      ppt: FilePptOutlined,
      text: FileTextOutlined,
      archive: FileZipOutlined,
      code: CodeOutlined,
    };
    const groups = {
      image: ['jpg','jpeg','png','gif','bmp','webp','svg','ico','tiff'],
      video: ['mp4','mov','avi','wmv','mkv','webm'],
      audio: ['mp3','wav','ogg','flac','aac'],
      pdf: ['pdf'], word: ['doc','docx','odt','rtf'],
      excel: ['xls','xlsx','ods','csv'], ppt: ['ppt','pptx','odp'],
      text: ['txt','md','json','xml','yaml','yml','log'],
      archive: ['zip','rar','7z','tar','gz'],
      code: ['html','htm','css','js','ts','jsx','tsx','php','py','java','c','cpp','rb','go','rs']
    };
    if (iconMap[file.resourceType]) return React.createElement(iconMap[file.resourceType]);
    for (const [type, exts] of Object.entries(groups)) {
      if (exts.includes(ext)) return React.createElement(iconMap[type] || FileOutlined);
    }
    return <FileOutlined />;
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => enqueueSnackbar('Link copied to clipboard!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('Failed to copy link', { variant: 'error' }));
  };

  const displayedFiles = files.slice(0, displayCount);

  return (
    <>
      {location.pathname === '/files' && (
        <div className="p-4 sticky top-0 bg-white z-50">
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowBigLeftDashIcon />}>Back to Dashboard</Button>
          </Link>
        </div>
      )}

      <Alert
        message="Tip: Rename downloads from `<slug>myfilepdf` → `myfile.pdf` for clarity."
        type="warning" showIcon closable className="mb-4"
      />

      < shinesdiv className="grid gap-6 grid-cols-1 p-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} hoverable bodyStyle={{ minHeight: 200 }}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))
        ) : displayedFiles.length > 0 ? (
          displayedFiles.map(file => {
            const age = getAgeInDays(file.createdAt);
            const rel = getRelativeTime(file.createdAt);
            const downloadUrl = file.downloadUrl || `${file.url}?fl=attachment:${encodeURIComponent(file.filename)}`;
            const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(downloadUrl)}`;
            const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(downloadUrl)}&text=${encodeURIComponent('Check out this file!')}`;
            const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(downloadUrl)}`;

            return (
              <Card
                key={file._id}
                title={
                  <Space>
                    {getFileIcon(file)}
                    <Tooltip title={file.slug}>
                      {file.filename.length > 20 ? file.filename.slice(0,20) + '…' : file.filename}
                    </Tooltip>
                    {age <= 2 && <Badge count="New" style={{ background: '#52c41a' }} />}
                  </Space>
                }
                actions={[
                  <a key="download" href={downloadUrl} download={file.filename} target="_blank" rel="noopener noreferrer">
                    <DownloadOutlined /> Download
                  </a>,
                  <Tooltip key="copy" title="Copy link">
                    <Button type="text" icon={<CopyOutlined />} onClick={() => copyLink(downloadUrl)} />
                  </Tooltip>,
                  <Tooltip key="share-whatsapp" title="Share on WhatsApp">
                    <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="text" icon={<WhatsAppOutlined />} />
                    </a>
                  </Tooltip>,
                  <Tooltip key="share-twitter" title="Share on X">
                    <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="text" icon={<TwitterOutlined />} />
                    </a>
                  </Tooltip>,
                  <Tooltip key="share-linkedin" title="Share on LinkedIn">
                    <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="text" icon={<LinkedinOutlined />} />
                    </a>
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="Delete this file?"
                    onConfirm={() => handleDelete(file.slug)}
                    okText="Yes" cancelText="No"
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
                  <strong>Uploaded:</strong> {rel}
                </p>

                {age > 0 && age < 30 && (
                  <Alert
                    type="warning"
                    showIcon
                    className="mb-2"
                    message={`Will be deleted in ${30 - age} days for security.`}
                  />
                )}

                {file.resourceType === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8, borderRadius: 8 }}
                  />
                ) : file.resourceType === 'raw' && file.filename.endsWith('.pdf') ? (
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    <FilePdfOutlined style={{ fontSize: 80, color: '#999' }} />
                    <p>Click to view or download</p>
                  </a>
                ) : (
                  <div
                    style={{
                      marginTop: 8, height: 150,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#fafafa', borderRadius: 8, color: '#999', fontSize: 48
                    }}
                  >
                    {getFileIcon(file)}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card hoverable className="text-center text-gray-400" bodyStyle={{ minHeight: 200 }}>
            <p>No files uploaded yet. Upload your first file above.</p>
          </Card>
        )}
      </div>

      {displayedFiles.length < files.length && (
        <div className="text-center mt-4">
          <Button onClick={() => setDisplayCount(c => c + 4)}>Load More</Button>
        </div>
      )}
    </>
  );
}
