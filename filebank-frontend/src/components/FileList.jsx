import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton, Alert, Input, Select, DatePicker } from 'antd';
import api from '../api/fileApi';
import { Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FaXTwitter, FaWhatsapp, FaLinkedin } from 'react-icons/fa6';
import { ArrowBigLeftDashIcon } from 'lucide-react';
import Lottie from 'lottie-react';
import newBadgeAnimation from '../assets/Badge.json';
import dayjs from 'dayjs';

import {
  FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  FilePptOutlined, FileTextOutlined, FileZipOutlined, AudioOutlined,
  VideoCameraOutlined, CodeOutlined, FileOutlined,
  DeleteOutlined, ClockCircleOutlined, DownloadOutlined, CopyOutlined
} from '@ant-design/icons';

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

  const getColorByFormat = (ext) => {
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

    for (let type in groups) {
      if (groups[type].includes(ext)) return colorMap[type];
    }
    return colorMap.default;
  };

  const getFileIcon = (file) => {
    const ext = (file.url.split('.').pop() || '').toLowerCase();
    const color = getColorByFormat(ext);

    const icons = {
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
      default: FileOutlined
    };

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

    for (let type in groups) {
      if (groups[type].includes(ext)) {
        const Icon = icons[type];
        return <Icon style={{ color }} />;
      }
    }
    return <icons.default style={{ color }} />;
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => enqueueSnackbar('Link copied!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('Copy failed', { variant: 'error' }));
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files');
      setFiles(data);
    } catch {
      enqueueSnackbar('Failed to load files', { variant: 'error' });
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

  const filteredFiles = files.filter(file => {
    const matchesName = file.filename.toLowerCase().includes(searchName.toLowerCase());
    const ext = (file.url.split('.').pop() || '').toLowerCase();

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
      {location.pathname === '/files' && (
        <div className="p-2 sticky top-0 bg-white z-50">
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowBigLeftDashIcon />}>Back to Dashboard</Button>
          </Link>
        </div>
      )}

      <Alert
        message="Tip: Rename downloads from `<slug>myfilepdf` → `myfile.pdf`."
        type="warning" showIcon closable className="m-6"
      />

      <div className="p-4 bg-white shadow-sm rounded-md mb-4 flex flex-wrap gap-4">
        <Input placeholder="Search by name" value={searchName} onChange={e => setSearchName(e.target.value)} style={{ width: 200 }} />
        <Select value={searchFormat} onChange={v => setSearchFormat(v)} style={{ width: 150 }}>
          <Option value="all">All Formats</Option>
          <Option value="image">Images</Option>
          <Option value="video">Videos</Option>
          <Option value="audio">Audio</Option>
          <Option value="pdf">PDF</Option>
          <Option value="word">Word</Option>
          <Option value="excel">Excel/CSV</Option>
          <Option value="ppt">PPT</Option>
          <Option value="text">Text</Option>
          <Option value="archive">Zip/Rar</Option>
          <Option value="code">Code</Option>
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
                className="fade-in"
                title={
                  <Space>
                    {getFileIcon(file)}
                    <Tooltip title={file.slug}>
                      {file.filename.length > 15 ? file.filename.slice(0, 15) + '…' : file.filename}
                    </Tooltip>
                    {age < 1 && (
                      <Lottie animationData={newBadgeAnimation} loop={false} style={{ width: 40, height: 40 }} />
                    )}
                  </Space>
                }
                actions={[
                  <a key="download" href={downloadUrl} download={file.filename}><DownloadOutlined /></a>,
                  <Tooltip key="copy" title="Copy link"><Button type="text" icon={<CopyOutlined />} onClick={() => copyLink(downloadUrl)} /></Tooltip>,
                  <a key="wa" href={`https://wa.me/?text=${encodeURIComponent(downloadUrl)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>,
                  <a key="tw" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(downloadUrl)}`} target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>,
                  <a key="li" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(downloadUrl)}`} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>,
                  <Popconfirm key="delete" title="Delete this file?" onConfirm={() => handleDelete(file.slug)}>
                    <Button danger type="text" icon={<DeleteOutlined />} loading={deleting === file.slug} />
                  </Popconfirm>
                ]}
              >
                <p className="text-gray-700"><ClockCircleOutlined style={{ marginRight: 4 }} /><strong>Uploaded:</strong> {formatted}</p>
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
    </>
  );
}

