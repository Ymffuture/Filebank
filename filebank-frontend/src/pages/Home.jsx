import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="dark:bg-[#333] dark:text-[whitesmoke] min-h-screen">
      <Navbar />
      <main className="mx-auto space-y-6">
        
        {/* 🔥 Smart Hero Section with Animation */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center py-10 px-4 bg-gradient-to-br from-[#0B3D91] to-[#1e1e2f] text-white rounded-2xl shadow-2xl max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Famacloud Dashboard Upload
          </h1>
          <div className="text-xl md:text-2xl font-medium">
            <TextType 
              text={[
                "Securely upload, access & share files",
                "Empower your workflow with smart AI tools",
                "Store your documents. Anywhere. Anytime.",
                "Fast. Reliable. Famacloud."
              ]}
              typingSpeed={70}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
            />
          </div>
        </motion.section>

        <section>
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
