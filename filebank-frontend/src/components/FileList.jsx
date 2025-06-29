import React, { useEffect, useState } from 'react';
import api from '../api/fileApi';
// import { Button } from '@/components/ui/button';

export default function FileList() {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    const res = await api.get('/');
    setFiles(res.data);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this file?')) return;
    await api.delete(`/${slug}`);
    fetchFiles();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {files.map((file) => (
        <div key={file._id} className="bg-white shadow p-3 rounded space-y-2">
          <h3 className="font-semibold">{file.filename}</h3>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Download / View
          </a>
          <button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleDelete(file.slug)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
