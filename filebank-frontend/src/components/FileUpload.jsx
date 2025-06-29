import React, { useState } from 'react';
import { Upload, Button, Alert, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/fileApi';
import FileList from './FileList';

export default function FileUpload({ onUpload }) {
  const [files, setFiles] = useState([]); // start with empty array
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");

  const handleSubmit = async () => {
    if (files.length === 0) {
      setText('No files selected.');
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append('file', f));

    setUploading(true);
    setProgress(0);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      });

      if (onUpload) onUpload(res.data);
      setText2('Upload complete 100%.');
      message.success('Upload successful!');
      setFiles([]); // clear selected files
    } catch (err) {
      console.error(err);
      setText('Upload file failed, please try again.');
      message.error('Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-[#F0F8FF] p-4 rounded shadow">
      <Upload
        beforeUpload={(file) => {
          setFiles(prev => [...prev, file]);
          setText("");
          setText2("");
          return false; 
        }}
        multiple
        fileList={files} // keeps antd in sync with our state
        onRemove={(file) => {
          setFiles(prev => prev.filter(f => f.uid !== file.uid));
        }}
      >
        <Button icon={<UploadOutlined />} disabled={uploading}>
          Select File(s)
        </Button>
      </Upload>

      <div className="mt-2">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {progress > 0 && (
        <div className="mt-2">
          <Progress percent={progress} />
        </div>
      )}
      <br />
      <hr />
      <br />
      {text && <Alert message={text} type="error" className="mt-2" />}
      {text2 && <Alert message={text2} type="success" className="mt-2" />}
      <FileList />
    </div>
  );
}
