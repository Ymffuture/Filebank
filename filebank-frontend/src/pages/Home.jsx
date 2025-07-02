import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { Card } from 'antd';
import FileBankDocumentary from "./FileBankDocumentary" ;
export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff] to-[#f0f4f8]">
      <Navbar />
      <main className="container mx-auto py-10 space-y-8 px-4">
        <Card
          className="shadow-lg rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, #e6edf5, #ffffff)',
            border: 'none',
            padding: '24px'
          }}
        >
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Upload Your Files</h1>
          <FileUpload onUpload={() => setRefresh((r) => r + 1)} />
        </Card>

        <Card
          className="shadow-lg rounded-2xl"
          style={{
            background: '#fff',
            border: 'none',
            padding: '24px'
          }}
        >
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Filebank Documentary</h1>
          <FileBankDocumentary/>
        </Card>
      </main>
    </div>
  );
}

