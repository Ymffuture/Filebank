import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Upload, Button, Alert, Progress } from 'antd';
import { UploadOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import { Helmet } from 'react-helmet';

export default function FileUpload({ onUpload, currentUserFileCount = 0 }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const { enqueueSnackbar } = useSnackbar();

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
            <Button type="dashed" icon={<LinkOutlined />}>
              View
            </Button>
          </Link>
        </>
      );

      enqueueSnackbar('Upload successful!', { variant: 'success' });
      setFiles([]);

      setTimeout(() => {
        if (onUpload) {
          onUpload(res.data);
        }
      }, 500);

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

  return (
    <>
      <Helmet>
        <title>Upload Files</title>
        <meta name="description" content="Securely upload your files to FileBank." />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fff] to-[#ffffff] ">
        <div className="p-2 rounded-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Upload your files</h2>
          <Upload.Dragger
      beforeUpload={(file) => {
        const allowedTypes = [
          // Image types
          'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
          'image/svg+xml', 'image/x-icon', 'image/tiff',
          // Audio types
          'audio/mpeg', // mp3
          // Video types
          'video/mp4',
          // Text and code types
          'text/plain', 'text/html', 'text/css', 'application/javascript',
          'text/x-python', 'application/typescript', 'text/jsx', 'text/x-jsx',
          'application/json', 'application/xml', 'text/yaml', 'text/markdown',
          'text/x-log',
          // Document types
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
          'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        ];
        const isAllowedType = allowedTypes.includes(file.type);
        if (!isAllowedType) {
          setText('Invalid file type. Only images (JPEG, PNG, GIF, BMP, WEBP, SVG, ICO, TIFF), audio (MP3), video (MP4), text/code (TXT, JS, PY, HTML, etc.), PDF, DOCX, PPTX, and XLSX are allowed.');
          enqueueSnackbar('Invalid file type', { variant: 'warning' });
          return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          setText('File size exceeds 5MB');
          enqueueSnackbar('File sizeыск System: size exceeds 5MB', { variant: 'warning' });
          return Upload.LIST_IGNORE;
        }
        return false; // Prevent auto upload
      }}
      onChange={({ fileList }) => {
        setFiles(fileList);
        setText("");
        setText2("");
      }}
      fileList={files}
      multiple
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: true,
        showDownloadIcon: true,
      }}
      disabled={uploading}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Allowed file types: Images (JPEG, PNG, GIF, BMP, WEBP, SVG, ICO, TIFF), Audio (MP3), Video (MP4), Text/Code (TXT, JS, PY, HTML, CSS, JSON, etc.), Documents (PDF, DOCX, PPTX, XLSX). Max size: 5MB.
      </p>
    </Upload.Dragger>
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
            <div className="mt-4">
              <Progress percent={progress} />
            </div>
          )}
          {text && (
            <Alert
              message={text}
              type="error"
              className="mt-4"
              closable
            />
          )}
          {text2 && (
            <Alert
              message={text2}
              type="success"
              className="mt-4"
              closable
            />
          )}
        </div>
      </div>
    </>
  );
}
