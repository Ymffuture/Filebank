import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Upload, Button, Alert, Progress } from 'antd';
import { UploadOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useSnackbar } from 'notistack';
import { Helmet } from 'react-helmet';
import Lottie from 'lottie-react';
import uploadAnimation from '../assets/uploading.json'; 
import UploadIcon from '../assets/Upload.json' ;
import Successful from '../assets/Successful.json' ;
import Failed from '../assets/Failed.json' ;
import pdfAnim from '../assets/PDF.json' ;
import api from '../api/fileApi';

export default function FileUpload({ onUpload, currentUserFileCount = 0 }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const { enqueueSnackbar } = useSnackbar();
const storedUser = JSON.parse(localStorage.getItem('filebankUser'));
const userRole = storedUser?.role || 'Free';
  const handleSubmit = async () => {
    if (files.length === 0) {
      setText('No files selected.');
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append('file', f.originFileObj));

    setUploading(true);
    setProgress(0);

    try {
      const res = await api.post('files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.floor((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      });

      setText2(
        <>
          Upload complete 100%.{' '}
          <Link to="/files" className="text-green-600 font-semibold hover:text-green-800">
            <Button type="link" icon={<LinkOutlined />}>View</Button>
          </Link>
        </>
      );

      enqueueSnackbar('Upload successful!', { variant: 'success' });
      setFiles([]);

      if (onUpload) onUpload(res.data);

    } catch (err) {
      console.error(err);
      setText(
        <>
          Something went wrong.{' '}
          <Button type="link" icon={<InfoCircleOutlined />}>
            <Link to="/help" className="text-green-600 font-semibold underline hover:text-green-800">
              Learn more
            </Link>
          </Button>
        </>
      );
      enqueueSnackbar('Upload failed.', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const allowedTypes = [ 
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
    'image/svg+xml', 'image/x-icon', 'image/tiff',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    // Video
    'video/mp4', 'video/webm', 'video/ogg',
    // Text & Code
    'text/plain', 'text/html', 'text/css', 'application/javascript',
    'application/json', 'application/xml', 'text/yaml', 'text/markdown', 'text/x-log',
    'text/x-python', 'application/x-python-code',
    'application/typescript', 'text/jsx', 'text/x-jsx',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Archives
    'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed',
    'application/x-rar-compressed', 'application/x-tar', 'application/gzip',
    // CSV & Data
    'text/csv', 'application/sql',
    // Fonts
    'font/ttf', 'font/woff', 'font/woff2', 'application/font-woff',
    // Configs & Binary
    'text/x-shellscript', 'text/x-config', 'application/octet-stream'
  ];

  return (
    <>
      <Helmet>
        <title>Upload Files | Famacloud</title>
        <meta name="description" content="Securely upload your files to Famacloud." />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen">
        <div className="rounded-lg max-w-lg w-full">
          {text2? 
           <div className="flex justify-center mb-4">
              <Lottie
                animationData={Successful}
                loop={false}
                style={{ width: 300, height: 300 }}
              />
            </div> : text? <div className="flex justify-center mb-6">
              <Lottie
                animationData={Failed}
                loop={false}
                style={{ width: 300, height: 300 }}
              />
            </div>: <div className="flex justify-center mb-4">
              <Lottie
                animationData={pdfAnim}
                
                style={{ width: 350, height: 350 }}
              />
            </div>} 

          {uploading ? (
            <div className="flex justify-center mb-4">
              <Lottie
                animationData={uploadAnimation}
                loop
                style={{ width: 300, height: 300 }}
              />
            </div>
          ) :
          <Upload.Dragger
            beforeUpload={(file) => {
              const isAllowedType = allowedTypes.includes(file.type);
              if (!isAllowedType) {
                setText('Invalid file type.');
                enqueueSnackbar('Invalid file type', { variant: 'warning' });
                return Upload.LIST_IGNORE;
              }
if (fileList.length > 5) {
  enqueueSnackbar("Maximum 5 files allowed per upload.", { variant: "warning" });
  return;
}

              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                setText('File size exceeds 5MB');
                enqueueSnackbar('File size exceeds 5MB', { variant: 'warning' });
                return Upload.LIST_IGNORE;
              }

              return false; // Manual upload
            }}
            onChange={({ fileList }) => {
              setFiles(fileList);
              setText("");
              setText2("");
            }}
            fileList={files}
            multiple={userRole !== 'Free'}

            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true,
            }}
            disabled={uploading}
          >
            <div className="flex justify-center mb-4">
              <Lottie
                animationData={UploadIcon}
                loop={false} 
                style={{ width: 150, height: 150 }}
              />
            </div>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Supported: Images, Documents, Audio, Video, Archives, Code Files. Max size: 5MB. (Max 5 Files per load. ) 
            </p>
          </Upload.Dragger>
          }

          
          <div className="mt-4 flex justify-center mb-8">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={uploading}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : 'Start Upload'}
            </Button>
          </div>

          {progress > 0 && (
            <div className="mt-4 sticky">
              <Progress percent={progress} />
            </div>
          )}

          {text && <Alert message={text} type="error" className="mt-4" closable />}
          {text2 && <Alert message={text2} type="success" className="mt-4" closable />}
        </div>
      </div>
    </>
  );
}
