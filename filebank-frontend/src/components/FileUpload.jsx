import React, { useState } from 'react';
import { Upload, Button, Alert, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

 import { useSnackbar } from 'notistack';
export default function FileUpload({ onUpload }) {
  const [files, setFiles] = useState([]); // start with empty array
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
   const {enqueueSnackbar} = useSnackbar()
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

  // Success actions
  setText2('Upload complete 100%.');
  enqueueSnackbar('Upload successful!', { variant: 'success' });
  setFiles([]);

  if (onUpload) {
    onUpload(res.data);
  }

} catch (err) {
  console.error(err);
  setText('Upload file failed, please try again.');
  enqueueSnackbar('Upload failed.', { variant: 'error' });
}finally {
    setUploading(false);
    setProgress(0);
  }
};

  return (
    <div className="bg-[#E1EEFA] p-12 m-0 rounded  text-[white]">
      <Upload
  beforeUpload={(file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      setText('File size exceeds 2MB. try upload less than 2MB');
      enqueueSnackbar('File size exceeds 2MB',{variant:'warning'})
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
  {uploading ? 'Uploading...' : 'Upload'}
</Button>

      </div>

      {progress > 0 && (
        <div className="mt-2">
          <Progress percent={progress} />
        </div>
      )}
      <br />
  
      <br />
      {text && <Alert message={text} type="error" className="mt-2 select-none" 
       description='Please check the internet connection'
      closable
      banner
      />}
      {text2 && <Alert message={text2} type="success" className="mt-2 select-none" 
      closable
      banner
      />}
  
    </div>
  );
}

