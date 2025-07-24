import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import FileBankDocumentary from '../components/FileBankDocumentary';
import Ai from '../components/Ai' ;
export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="bg-gradient-to-br from-[#fff] to-[#fff]">
      <Navbar />
      <main className="mx-auto p-2 space-y-2">
        <section>
          <FileUpload onUpload={() => setRefresh((r) => r + 1)} userRole={user?.role} />
        </section>
<section>
  <Ai/>
</section>
        <section>
          <FileBankDocumentary />
        </section>
      </main>
    </div>
  );
}
