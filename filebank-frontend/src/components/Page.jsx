import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Download, Copy } from 'lucide-react';

const Page = () => {
  const API_KEY = "AIzaSyDE5c4rUcO-mny8cREEqfMESVYCAtU0SYk"; // move to env in production
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  const MAX_RETRIES = 5;

  const [status, setStatus] = useState({ message: '', color: 'text-gray-700', visible: false });
  const [feedbackRaw, setFeedbackRaw] = useState(''); // store plain text returned by LLM
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrag = (e, addClasses) => {
    preventDefaults(e);
    const dropArea = document.getElementById('dropArea');
    if (!dropArea) return;
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
    setFeedbackRaw('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const cvContent = event.target.result;
      if (!cvContent || !cvContent.toString().trim()) {
        setStatus({ message: "The file is empty.", color: "text-red-500", visible: true });
        return;
      }
      await analyzeCVWithGemini(cvContent.toString());
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
        const systemPrompt = "You are a world-class career advisor. Analyze the CV and provide feedback on strengths, weaknesses, and suggestions. Use headings and clear, structured plain text.";
        const userPrompt = `Analyze this CV:\n\n${cvText}`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            // keep request compact — adapt as per API docs if needed
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            // exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            retryCount++;
            continue;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || result.output?.[0]?.content?.text || null;
        if (!text) {
          setStatus({ message: "No content returned by Gemini.", color: "text-red-500", visible: true });
          return;
        }

        // store raw plain text (preserve newlines)
        setFeedbackRaw(text);
        setShowFeedback(true);
        setStatus({ message: "Analysis complete!", color: "text-green-500", visible: true });
        setCopied(false);
        return;
      } catch (err) {
        setStatus({ message: `Error: ${err.message}`, color: "text-red-500", visible: true });
        console.error("analyzeCVWithGemini error:", err);
        break;
      }
    }

    if (retryCount >= MAX_RETRIES) setStatus({ message: "Failed after retries. Try again later.", color: "text-red-500", visible: true });
  };

  const downloadFeedback = () => {
    const textToSave = feedbackRaw || '';
    const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "CV_Feedback.txt");
  };

  const copyFeedback = async () => {
    try {
      await navigator.clipboard.writeText(feedbackRaw || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("copy failed", err);
      setStatus({ message: "Failed to copy to clipboard", color: "text-red-500", visible: true });
    }
  };

  // Render feedback with simple markdown-ish heading detection:
  const renderFeedback = () => {
    if (!feedbackRaw) return null;
    const lines = feedbackRaw.split(/\r?\n/);
    const nodes = [];
    let buffer = [];

    const flushBuffer = () => {
      if (buffer.length > 0) {
        nodes.push(
          <p key={`p-${nodes.length}`} className="text-gray-800 whitespace-pre-wrap">
            {buffer.join('\n')}
          </p>
        );
        buffer = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/^#{1,6}\s+/.test(trimmed)) {
        // heading like "# Title" -> bold heading + horizontal rule
        flushBuffer();
        const headingText = trimmed.replace(/^#{1,6}\s+/, '');
        nodes.push(
          <div key={`h-${idx}`} className="mt-4">
            <div className="font-bold text-gray-900">{headingText}</div>
            <hr className="my-2 border-gray-200" />
          </div>
        );
      } else if (/^[-*]\s+/.test(trimmed)) {
        // bullet — accumulate into buffer so bullets keep newlines
        buffer.push(trimmed);
      } else if (trimmed === '') {
        // blank line: flush
        flushBuffer();
      } else {
        buffer.push(line);
      }
    });

    flushBuffer();
    return nodes;
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">CV Analyzer</h1>
        <p className="text-gray-600 text-center mb-6">Upload your CV (.txt) to get a detailed analysis powered by FamaAI.</p>

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
          <p className="mt-2 text-sm text-gray-700 font-semibold">Drag & drop your CV here or browse files</p>
        </div>

        {status.visible && (
          <div className={`mt-6 text-center text-sm font-medium ${status.color}`}>
            {status.message}
          </div>
        )}

        {showFeedback && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">FamaAI Feedback</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadFeedback}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:shadow text-gray-700"
                  title="Download feedback as .txt"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download</span>
                </button>

                <button
                  onClick={copyFeedback}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  title="Copy feedback to clipboard"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => { setShowFeedback(false); setFeedbackRaw(''); setStatus({ message: '', color: 'text-gray-700', visible: false }); }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 border hover:shadow text-sm"
                  title="Clear feedback"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mt-4 prose prose-slate max-w-none text-gray-800">
              {/* Rendered into readable blocks with bold headings and horizontal rules */}
              { renderFeedback() }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

