import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Popconfirm, Tooltip, Skeleton, Alert, Badge, Input, Select, DatePicker } from 'antd';
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
      ? `Today at ${date.toLocaleTimeString('en-ZA', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      : date.toLocaleString('en-ZA', { weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const getAgeInDays = (createdAt) => {
    if (!createdAt) return 0;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

  const getFileIcon = (file) => {
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
      code: CodeOutlined
    };

    for (let type in groups) {
      if (groups[type].includes(ext)) return React.createElement(icons[type]);
    }
    return <FileOutlined />;
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => enqueueSnackbar('Link copied!', { variant: 'success' }))
      .catch(() => enqueueSnackbar('Copy failed', { variant: 'error' }));
  };

  // === NEW: Filtered Files ===
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

      {/* === NEW: Filters UI === */}
      <div className="p-4 bg-white shadow-sm rounded-md mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="Search by name"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={searchFormat}
          onChange={v => setSearchFormat(v)}
          style={{ width: 150 }}
        >
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
        <DatePicker
          value={searchDate}
          onChange={d => setSearchDate(d)}
          placeholder="Filter by date"
          style={{ width: 180 }}
        />
        <Button onClick={() => {
          setSearchName('');
          setSearchFormat('all');
          setSearchDate(null);
        }}>
          Reset
        </Button>
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
            const waUrl = `https://wa.me/?text=${encodeURIComponent(downloadUrl)}`;
            const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(downloadUrl)}`;
            const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(downloadUrl)}`;

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
                    {age <= 1 && <Badge count="New" style={{ background: '#52c41a' }} />}
                  </Space>
                }
                actions={[
                  <a key="download" href={downloadUrl} download={file.filename}><DownloadOutlined /></a>,
                  <Tooltip key="copy" title="Copy link"><Button type="text" icon={<CopyOutlined />} onClick={() => copyLink(downloadUrl)} /></Tooltip>,
                  <a key="wa" href={waUrl} target="_blank" rel="noopener noreferrer"><Button type="text" icon={<FaWhatsapp />} /></a>,
                  <a key="tw" href={twUrl} target="_blank" rel="noopener noreferrer"><Button type="text" icon={<FaXTwitter />} /></a>,
                  <a key="li" href={liUrl} target="_blank" rel="noopener noreferrer"><Button type="text" icon={<FaLinkedin />} /></a>,
                  <Popconfirm key="delete" title="Delete this file?" onConfirm={() => handleDelete(file.slug)}>
                    <Button danger type="text" icon={<DeleteOutlined />} loading={deleting === file.slug} />
                  </Popconfirm>
                ]}
              >
                <p className="text-gray-700"><ClockCircleOutlined style={{ marginRight: 4 }} /><strong>Uploaded:</strong> {formatted}</p>
                {age > 0 && age < 30 && (
                  <Alert type="warning" showIcon className="m-4" message={`Will be deleted in ${30 - age} days for security.`} />
                )}
                {file.resourceType === 'image' ? (
                  <img src={file.url} alt={file.filename} className="rounded" style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginTop: 8 }} />
                ) : file.resourceType === 'raw' && file.filename.endsWith('.pdf') ? (
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="m-2">
                    <FilePdfOutlined style={{ fontSize: 80, color: '#999' }} /><p>Click to view</p>
                  </a>
                ) : (
                  <div style={{ marginTop: 8, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 8, color: '#999', fontSize: 48 }}>
                    {getFileIcon(file)}
                  </div>
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
    </>
  );
}

