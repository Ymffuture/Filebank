import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import FileBankDocumentary from '../components/FileBankDocumentary';
import Ai from '../components/Ai';
import TextType from './TextType';
export default function Home() {
  const [refresh, setRefresh] = useState(0);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('filebankUser'));
    if (storedUser?.role) {
      setUserRole(storedUser.role);
    }
  }, []);

  return (
    <div className="dark:bg-[#666] ">
      <Navbar />
      <main className="mx-auto space-y-2">
        

<TextType 
  text={["Text typing effect", "for your websites", "Happy coding!"]}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/>
        <section>
          {/* ✅ Now passing the correct role from localStorage */}
          <FileUpload onUpload={() => setRefresh((r) => r + 1)} userRole={userRole} />
        </section>

        <section>
          <Ai />
        </section>

        <section>
          <FileBankDocumentary />
        </section>
      </main>
    </div>
  );
}
