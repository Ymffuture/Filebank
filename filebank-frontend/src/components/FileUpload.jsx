import React, { useState } from 'react';
import { Upload, Button, Alert, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/fileApi';

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
          const percent = Math.floor((e.loaded * 100) / e.total);
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

const beforeUpload =(file)=>{
 
    
}
  return (
    <div className="bg-[#E1EEFA] p-2 -m-0 rounded flex-1/12 text-[white]">
      <Upload
        beforeUpload={(file) => {
           const isLt2M =file.size/1024/1024<2;
  if(!isLt2M){
    setText('File size exceeds 2MB')
 return isLt2M || Upload.LIST_IGNORE;
  }
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
        className='flex gap-9'
        showUploadList={{
        showPreviewIcon:true,
        showRemoveIcon:true,
        showDownloadIcon:true,
        }}
        listType='picture-card'
        disabled={uploading}
      >
        <Button  disabled={uploading} type='link'>
         Import/Drop file(s)
        </Button>
      </Upload>

      <div className="mt-2">
        <Button
          type="link"
          onClick={handleSubmit}
          loading={uploading}
          icon={<UploadOutlined />}
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
