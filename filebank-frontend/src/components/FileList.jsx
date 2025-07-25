import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton, Alert, Input, Select, DatePicker } from 'antd';
import api from '../api/fileApi';
import { Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  FilePptOutlined, FileTextOutlined, FileZipOutlined, AudioOutlined,
  VideoCameraOutlined, CodeOutlined, FileOutlined,
  DeleteOutlined, ClockCircleOutlined, DownloadOutlined, CopyOutlined
} from '@ant-design/icons';
import { FaXTwitter, FaWhatsapp, FaLinkedin } from 'react-icons/fa6';
import { ArrowBigLeftDashIcon } from 'lucide-react';
import dayjs from 'dayjs';
import Lottie from 'lottie-react';
import NewBadgeAnimation from '../assets/Badge.json';
import { motion } from 'framer-motion';
import errorAnimation from '../assets/server.json'; // Place your Lottie JSON here

const { Option } = Select;

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [displayCount, setDisplayCount] = useState(4);
  const [searchName, setSearchName] = useState('');
  const [searchFormat, setSearchFormat] = useState('all');
  const [searchDate, setSearchDate] = useState(null);
  const [error, setError] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return isToday
      ? `Today at ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      : date.toLocaleString('en-ZA', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getAgeInDays = (createdAt) => {
    if (!createdAt) return 0;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const fetchFiles = async () => {
  setLoading(true);
  setError(null);

  try {
    const { data } = await api.get('/files');
    setFiles(data);
  } catch (err) {
    enqueueSnackbar('Failed to load files', { variant: 'error' });
    setError(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchFiles(); }, [refresh]);

  const handleDelete = async (slug) => {
    setDeleting(slug);
    try {
      await api.delete(`/files/${slug}`);
      enqueueSnackbar('File deleted', { variant: 'success' });
      setRefresh(r => r + 1);
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const colorMap = {
    image: '#1E90FF',
    video: '#FF6347',
    audio: '#32CD32',
    pdf: '#D32F2F',
    word: '#1976D2',
    excel: '#388E3C',
    ppt: '#F57C00',
    text: '#616161',
    archive: '#8E24AA',
    code: '#FFC107',
    default: '#999999'
  };


const ErrorFallback = ({ onRetry }) => (
  <motion.div
    className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="w-64 h-64 mb-6">
      <Lottie animationData={errorAnimation} loop={true} />
    </div>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
      Looks like something went wrong on our end. Please try again or contact support if the issue persists.
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white rounded-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
    >
      Retry
    </button>
  </motion.div>
);


  const groups = {
    image: ['jpg','jpeg','png','gif','bmp','webp'],
    video: ['mp4','mov','avi','wmv'],
    audio: ['mp3','wav','ogg'],
    pdf: ['pdf'],
    word: ['doc','docx'],
    excel: ['xls','xlsx','csv'],
    ppt: ['ppt','pptx'],
    text: ['txt','md'],
    archive: ['zip','rar'],
    code: ['js','jsx','ts','tsx','php','py','java']
  };

  const getFileIcon = (file) => {
    const ext = (file.url.split('.').pop() || '').toLowerCase();

    for (let type in groups) {
      if (groups[type].includes(ext)) {
        const iconProps = { style: { color: colorMap[type], fontSize: 24 } };
        switch (type) {
          case 'image': return <FileImageOutlined {...iconProps} />;
          case 'video': return <VideoCameraOutlined {...iconProps} />;
          case 'audio': return <AudioOutlined {...iconProps} />;
          case 'pdf': return <FilePdfOutlined {...iconProps} />;
          case 'word': return <FileWordOutlined {...iconProps} />;
          case 'excel': return <FileExcelOutlined {...iconProps} />;
          case 'ppt': return <FilePptOutlined {...iconProps} />;
          case 'text': return <FileTextOutlined {...iconProps} />;
          case 'archive': return <FileZipOutlined {...iconProps} />;
          case 'code': return <CodeOutlined {...iconProps} />;
          default: break;
        }
      }
    }
    return <FileOutlined style={{ color: colorMap.default, fontSize: 24 }} />;
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => enqueueSnackbar('Link copied!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('Copy failed', { variant: 'error' }));
  };

  const filteredFiles = files.filter(file => {
    const matchesName = file.filename.toLowerCase().includes(searchName.toLowerCase());
    const ext = (file.url.split('.').pop() || '').toLowerCase();

    let matchesFormat = searchFormat === 'all';
    if (!matchesFormat) {
      for (let group in groups) {
        if (groups[group].includes(ext) && searchFormat === group) {
          matchesFormat = true;
          break;
        }
      }
    }

    let matchesDate = true;
    if (searchDate) {
      const fileDate = dayjs(file.createdAt).format('YYYY-MM-DD');
      const selectedDate = dayjs(searchDate).format('YYYY-MM-DD');
      matchesDate = fileDate === selectedDate;
    }

    return matchesName && matchesFormat && matchesDate;
  });

  const displayedFiles = filteredFiles.slice(0, displayCount);

  return (

    <>
      {error? 
      <ErrorFallback onRetry={() => setRefresh(r => r + 1)} />
    :
    <>
      {location.pathname === '/files' && (
        <div className="p-2 sticky top-0 bg-white z-50">
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowBigLeftDashIcon />}>Back to Dashboard</Button>
          </Link>
        </div>
      )}

      <Alert message="Tip: Rename downloads from `<slug>myfilepdf` → `myfile.pdf`." type="warning" showIcon closable className="m-6" />

      <div className="p-4 shadow-sm rounded-md mb-4 flex flex-wrap gap-4">
        <Input placeholder="Search by name" value={searchName} onChange={e => setSearchName(e.target.value)} style={{ width: 200 }} />
        <Select value={searchFormat} onChange={v => setSearchFormat(v)} style={{ width: 150 }}>
          <Option value="all">All Formats</Option>
          {Object.keys(groups).map(group => <Option key={group} value={group}>{group.charAt(0).toUpperCase() + group.slice(1)}</Option>)}
        </Select>
        <DatePicker value={searchDate} onChange={d => setSearchDate(d)} placeholder="Filter by date" style={{ width: 180 }} />
        <Button onClick={() => { setSearchName(''); setSearchFormat('all'); setSearchDate(null); }}>Reset</Button>
      </div>

      <div className="grid gap-6 grid-cols-1 p-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} hoverable bodyStyle={{ minHeight: 300 }}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))
        ) : displayedFiles.length > 0 ? (
          displayedFiles.map(file => {
            const age = getAgeInDays(file.createdAt);
            const formatted = formatTime(file.createdAt);
            const downloadUrl = file.downloadUrl || `${file.url}?fl=attachment:${encodeURIComponent(file.filename)}`;

            return (
              <Card
                key={file._id}
                title={
                  <Space>
                    {getFileIcon(file)}
                    <Tooltip title={file.slug}>
                      {file.filename.length > 15 ? file.filename.slice(0, 15) + '…' : file.filename}
                    </Tooltip>
                    {age === 0 && (
                      <Lottie animationData={NewBadgeAnimation} loop={false} style={{ width: 40, height: 40 }} />
                    )}
                  </Space>
                }     
        actions={[
              <Space key="actions" size="middle" style={{ justifyContent: 'center', width: '100%' }}>

             <Tooltip title="Download">
      <Button
        type="text"
        shape="circle"
        icon={<DownloadOutlined />}
        style={{ background: '#e6f7ff', color: '#1890ff' }}
        href={downloadUrl}
        download={file.filename}
      />
    </Tooltip>

    <Tooltip title="Copy link">
      <Button
        type="text"
        shape="circle"
        icon={<CopyOutlined />}
        onClick={() => copyLink(downloadUrl)}
        style={{ background: '#fff7e6', color: '#fa8c16' }}
      />
    </Tooltip>

    <Tooltip title="Share on WhatsApp">
      <Button
        type="text"
        shape="circle"
        icon={<FaWhatsapp />}
        href={`https://wa.me/?text=${encodeURIComponent(downloadUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: '#dcf8c6', color: '#25D366' }}
      />
    </Tooltip>

    <Tooltip title="Share on X">
      <Button
        type="text"
        shape="circle"
        icon={<FaXTwitter />}
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(downloadUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: '#e8f5fd', color: '#1DA1F2' }}
      />
    </Tooltip>

    <Tooltip title="Share on LinkedIn">
      <Button
        type="text"
        shape="circle"
        icon={<FaLinkedin />}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(downloadUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: '#eef3f8', color: '#0077B5' }}
      />
    </Tooltip>

    <Tooltip title="Delete file">
      <Popconfirm
        title="Delete this file?"
        onConfirm={() => handleDelete(file.slug)}
      >
        <Button
          danger
          type="text"
          shape="circle"
          icon={<DeleteOutlined />}
          loading={deleting === file.slug}
          style={{ background: '#fff1f0', color: '#ff4d4f' }}
        />
      </Popconfirm>
    </Tooltip>

  </Space>
]}
 
              >
                <p className="text-gray-700"><ClockCircleOutlined style={{ marginRight: 4 }} /><strong>Uploaded:</strong> {formatted}</p>
                {age > 0 && age < 180 && (
                  <Alert type="warning" showIcon className="m-4" message={`Will be deleted in ${180 - age} days.`} />
                )}
              </Card>
            );
          })
        ) : (
          <Card className="text-center text-[gray]" bodyStyle={{ minHeight: 200 }}>
            <p>No files match your search.</p>
          </Card>
        )}
      </div>

      {displayedFiles.length < filteredFiles.length && (
        <div className="text-center m-6">
          <Button type="link" onClick={() => setDisplayCount(c => c + 4)}>Load More</Button>
        </div>
      )}
    </>} 
        
    </>
  );
}
