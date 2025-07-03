import React, { useState } from 'react';
import {Link} from "react-router-dom" ;
import { Upload, Button, Alert, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import { useSnackbar } from 'notistack';
import {Helmet} from 'react-helmet' ;
export default function FileUpload({ onUpload, currentUserFileCount = 0}) {
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
      <Button type='dashed' >
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
      setText(<>
    Something went wrong.{' '}
    <Link to="/help" className="text-green-600 font-semibold underline hover:text-green-800">
      <Button type='link' >
      Learn more
      </Button>
    </Link>
  </>);
      enqueueSnackbar('Upload failed.', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
  <>
  <Helmet>
        <title>Up Load Files</title>
        <meta name="description" content="Learn about FileBank — a secure file management platform by Qurovex Institute." />
      </Helmet>
  
    <div className="bg-[white] p-12 m-0 rounded text-[#333]">
    
      <Upload
        beforeUpload={(file) => {
          const isLt2M = file.size / 1024 / 1024 < 5;
          if (!isLt2M) {
            setText('something went wrong.');
            enqueueSnackbar('File size exceeds 5MB', { variant: 'warning' });
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
        listType="picture-card"
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
          showDownloadIcon: true
        }}
        disabled={uploading}
      >
        <Button disabled={uploading} type="link">
          Import/Drop file(s)
        </Button>
      </Upload>

      <div className="mt-2">
        <Button
          type="link"
          onClick={handleSubmit}
          loading={uploading}
          icon={<UploadOutlined />}
          disabled={uploading || files.length === 0}
        >
          {uploading ? 'Please wait...' : 'Upload'}
        </Button>
      </div>

      {progress > 0 && (
        <div className="mt-2">
          <Progress percent={progress} />
        </div>
      )}

      {text && (
        <Alert
          message={text}
          type="error"
          className="mt-2 select-none"
          description="Please check the internet connection, Or try Logging in."
          closable
          banner
        />
      )}

      {text2 && (
        <Alert
          message={text2}
          type="success"
          className="mt-2 select-none"
          description="To see your file(s) please navigate to Files and manage" 
          closable
          banner
        />
      )}
    </div>
  </>
  );
}

