import React, { useState } from 'react';

const Page = () => {
  const API_KEY = "AIzaSyDE5c4rUcO-mny8cREEqfMESVYCAtU0SYk";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  const MAX_RETRIES = 5;

  const [status, setStatus] = useState({ message: '', color: 'text-gray-700', visible: false });
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrag = (e, addClasses) => {
    preventDefaults(e);
    const dropArea = document.getElementById('dropArea');
    if (addClasses) {
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    } else {
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const processFile = (file) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setStatus({ message: "PDF files are not supported. Please upload a .txt file.", color: "text-red-500", visible: true });
      return;
    }

    setStatus({ message: "Reading file...", color: "text-blue-500", visible: true });
    setShowFeedback(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const cvContent = event.target.result;
      if (cvContent.trim() === "") {
        setStatus({ message: "The file is empty.", color: "text-red-500", visible: true });
        return;
      }
      await analyzeCVWithGemini(cvContent);
    };
    reader.onerror = () => {
      setStatus({ message: "Failed to read the file.", color: "text-red-500", visible: true });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    handleDrag(e, false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const analyzeCVWithGemini = async (cvText) => {
    if (!API_KEY) {
      setStatus({ message: "API key not found.", color: "text-red-500", visible: true });
      return;
    }

    setStatus({ message: "Analyzing CV...", color: "text-blue-500", visible: true });
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        const systemPrompt = "You are a world-class career advisor. Analyze the CV and provide feedback on: 1. Strengths. 2. Areas for improvement. 3. Suggestions. Use Markdown with headings and bullet points.";
        const userPrompt = `Analyze this CV:\n\n${cvText}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          setFeedback(result.candidates[0].content.parts[0].text);
          setShowFeedback(true);
          setStatus({ message: "Analysis complete!", color: "text-green-500", visible: true });
        } else {
          setStatus({ message: "No content from Gemini.", color: "text-red-500", visible: true });
        }
        return;
      } catch (error) {
        setStatus({ message: "An error occurred.", color: "text-red-500", visible: true });
        break;
      }
    }

    if (retryCount >= MAX_RETRIES) {
      setStatus({ message: "Failed after retries. Try again later.", color: "text-red-500", visible: true });
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">CV Analyzer</h1>
        <p className="text-gray-500 text-center mb-6">Upload your CV to get instant feedback from Gemini.</p>

        <div
          id="dropArea"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 transition duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={() => document.getElementById('fileInput').click()}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".txt,.docx,.pdf"
            onChange={handleFile}
          />
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v9"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600 font-semibold">Drag & drop your CV here</p>
          <p className="text-xs text-gray-500 mt-1">or</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105">
            Browse Files
          </button>
        </div>

        {status.visible && (
          <div className={`mt-6 text-center text-sm font-medium ${status.color}`}>
            {status.message}
          </div>
        )}

        {showFeedback && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gemini's Feedback</h2>
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 prose prose-slate max-w-none text-gray-800">
              <div dangerouslySetInnerHTML={{ __html: feedback }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
