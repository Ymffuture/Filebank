import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import FileBankDocumentary from '../components/FileBankDocumentary';
import Ai from '../components/Ai' ;
export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff] to-[#fff]">
      <Navbar />
      <main className="container mx-auto py-5 space-y-6 px-2">
        <section>
          <h1 className="text-3xl font-bold text-gray-700 mb-0">Start uploading Your Files</h1>
          <FileUpload onUpload={() => setRefresh((r) => r + 1)} />
        </section>
<section>
  <Ai/>
</section>
  
  
        <section>
          <h1 className="text-3xl font-bold text-[#222]">Documentary</h1>
          <FileBankDocumentary />
        </section>
      </main>
    </div>
  );
}
