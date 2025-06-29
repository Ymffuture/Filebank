import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <Navbar />
      <main className="container mx-auto py-6 space-y-6">
        <FileUpload onUpload={() => setRefresh((r) => r + 1)} />
        <FileList key={refresh} />
      </main>
    </div>
  );
}
