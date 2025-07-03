import React from 'react';
import { Alert, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { WifiOff, ServerCrash, LogInIcon, FileIcon } from 'lucide-react';

const { Title, Paragraph } = Typography;

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] p-4 flex justify-center items-start">
      <Card className="max-w-2xl w-full shadow-lg rounded-xl p-6">
        <Title level={2} className="text-center text-[#1E90FF]">📘 FileBank Help & Info</Title>

        <Alert
          type="info"
          showIcon
          message="Why am I seeing an error?"
          description={
            <>
              <ul className="list-disc pl-6 text-sm">
                <li className="flex items-center gap-2">
                  <WifiOff size={16} /> Your internet connection may be slow or disconnected.
                </li>
                <li className="flex items-center gap-2">
                  <ServerCrash size={16} /> The server may be temporarily down (try again in 50 seconds or more).
                </li>
                <li className="flex items-center gap-2">
                  <LogInIcon size={16} /> You may not be logged in. Please <Link to="/login" className="text-blue-600 underline">Login</Link>.
                </li>
              </ul>
            </>
          }
          className="mb-6"
        />

        <Title level={4}>Supported File Types</Title>
        <Paragraph>
          FileBank accepts most common file types:
        </Paragraph>
        <ul className="list-disc pl-6">
          <li className="flex items-center gap-2">
            <FileIcon size={16} /> <strong>Images</strong>: jpg, jpeg, png, gif, bmp, webp, svg
          </li>
          <li className="flex items-center gap-2">
            <FileIcon size={16} /> <strong>Documents</strong>: pdf, docx, xlsx, pptx, txt, csv
          </li>
          <li className="flex items-center gap-2">
            <FileIcon size={16} /> <strong>Archives</strong>: zip, rar, 7z, tar.gz
          </li>
          <li className="flex items-center gap-2">
            <FileIcon size={16} /> <strong>Media</strong>: mp3, mp4, mov, avi
          </li>
          <li className="flex items-center gap-2">
            <FileIcon size={16} /> <strong>Code files</strong>: js, py, java, php, html
          </li>
        </ul>

        <Paragraph className="mt-4">
          If you upload unsupported or dangerous files (e.g. <span className="text-red-500">.exe</span>, <span className="text-red-500">.bat</span>), they will be blocked for security reasons.
        </Paragraph>

        <div className="mt-6 text-center">
          <Link to="/files" className="text-[#1E90FF] underline hover:text-blue-700">
            Go to your files
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default HelpPage;

