import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { CheckOutlined, DownloadOutlined, CopyOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Button, message } from 'antd';

const Page = () => {
  const API_KEY = "AIzaSyDE5c4rUcO-mny8cREEqfMESVYCAtU0SYk";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  const MAX_RETRIES = 5;

  const [status, setStatus] = useState({ message: '', color: 'text-gray-700', visible: false });
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState('');

  const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrag = (e, addClasses) => {
    preventDefaults(e);
    const dropArea = document.getElementById('dropArea');
    if (addClasses) dropArea.classList.add('border-blue-500', 'bg-blue-50');
    else dropArea.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const processFile = (file) => {
    const allowedTypes = ["text/plain"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      setStatus({ message: "Only .txt files are supported.", color: "text-red-500", visible: true });
      return;
    }

    setStatus({ message: "Reading file...", color: "text-blue-500", visible: true });
    setShowFeedback(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const cvContent = event.target.result;
      if (!cvContent.trim()) {
        setStatus({ message: "The file is empty.", color: "text-red-500", visible: true });
        return;
      }
      await analyzeCVWithGemini(cvContent);
    };
    reader.onerror = () => setStatus({ message: "Failed to read the file.", color: "text-red-500", visible: true });
    reader.readAsText(file);
  };

  const handleDrop = (e) => { handleDrag(e, false); const file = e.dataTransfer.files[0]; if (file) processFile(file); };
  const handleFile = (e) => { const file = e.target.files[0]; if (file) processFile(file); };

  const analyzeCVWithGemini = async (cvText) => {
    if (!API_KEY) { setStatus({ message: "API key not found.", color: "text-red-500", visible: true }); return; }
    setStatus({ message: "Analyzing CV...", color: "text-blue-500", visible: true });

    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        const systemPrompt = "You are a world-class career advisor. Analyze the CV and provide feedback on strengths, weaknesses, and suggestions. Use Markdown headings, bullet points, and numbered lists.";
        const userPrompt = `Analyze this CV:\n\n${cvText}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            retryCount++;
            continue;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          setStatus({ message: "No content returned by Gemini.", color: "text-red-500", visible: true });
          return;
        }

        setFeedback(text.replace(/\n/g, '<br/>'));
        setShowFeedback(true);
        setStatus({ message: "Analysis complete!", color: "text-green-500", visible: true });
        setCopied(false);
        setReaction('');
        return;
      } catch (err) {
        setStatus({ message: `Error: ${err.message}`, color: "text-red-500", visible: true });
        break;
      }
    }

    if (retryCount >= MAX_RETRIES) setStatus({ message: "Failed after retries. Try again later.", color: "text-red-500", visible: true });
  };

  const downloadFeedback = () => {
    const blob = new Blob([feedback.replace(/<br\/>/g, '\n')], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "CV_Feedback.txt");
  };

  const copyFeedback = () => {
    navigator.clipboard.writeText(feedback.replace(/<br\/>/g, '\n')).then(() => {
      setCopied(true);
      message.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const reactionMenu = (
    <Menu
      items={['👍', '❤️', '😮', '🎯'].map(emoji => ({
        key: emoji,
        label: (
          <span onClick={() => setReaction(emoji)} className="cursor-pointer text-xl">
            {emoji}
          </span>
        ),
      }))}
    />
  );

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">CV Analyzer</h1>
        <p className="text-gray-500 text-center mb-6">Upload your CV to get instant feedback powered by FamaAI.</p>

        <div
          id="dropArea"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 transition duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={() => document.getElementById('fileInput').click()}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
        >
          <input type="file" id="fileInput" className="hidden" accept=".txt" onChange={handleFile} />
          <p className="mt-2 text-sm text-gray-600 font-semibold">Drag & drop your CV here or browse files</p>
        </div>

        {status.visible && <div className={`mt-6 text-center text-sm font-medium ${status.color}`}>{status.message}</div>}

        {showFeedback && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">FamaAI Feedback</h2>
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 prose prose-slate max-w-none text-gray-800">
              <div dangerouslySetInnerHTML={{ __html: feedback }} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-4 items-center">
              <Button type="primary" icon={<DownloadOutlined />} onClick={downloadFeedback}>
                Download (.txt)
              </Button>

              <Button type="default" icon={<CopyOutlined />} onClick={copyFeedback}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>

              <Dropdown overlay={reactionMenu} placement="bottomLeft" trigger={['click']}>
                <Button icon={<SmileOutlined />}>
                  {reaction ? reaction : 'React'}
                </Button>
              </Dropdown>

              {reaction && <span className="ml-2 text-lg">You reacted: {reaction}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

