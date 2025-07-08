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
      <main className="container mx-auto py-10 space-y-12 px-4">
        <section>
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Start uploading Your Files</h1>
          <FileUpload onUpload={() => setRefresh((r) => r + 1)} />
        </section>
<section>
<h1>Ask AI</h1>
  <Ai/>
</section>
  
  
        <section>
          <h1 className="text-3xl font-bold text-[#222] mb-2">FileBank Documentary</h1>
          <FileBankDocumentary />
        </section>
      </main>
    </div>
  );
}
