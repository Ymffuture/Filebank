import React from 'react';
import { Alert, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';
import { WifiOff, ServerCrash, LogInIcon, FileIcon, Download } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

const blockedExts = ['.exe', '.bat', '.cmd', '.sh', '.js', '.php', '.py', '.jar', '.msi', '.com', '.vbs'];
const luckyColors = {
  primary: '#1E90FF',    // Blue
  accent:  '#FFD700',    // Gold
  secondary: '#32CD32'   // Green
};
const luckyNumbers = [2, 3, 5, 8, 9];

export default function HelpPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-blue-50 to-green-50 p-8 flex flex-col lg:flex-row">
      {/* Left Panel: Info */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12">
        <Title level={2} style={{ color: luckyColors.primary }} className="mb-4">
          FileBank Help & Download Guide
        </Title>

        <Alert
          type="info"
          showIcon
          icon={<WifiOff size={20} />}
          message={<Text strong style={{ color: luckyColors.accent }}>Connection & Access Issues</Text>}
          description={
            <ul className="list-disc pl-6 text-sm">
              <li className="flex items-center gap-2">
                <WifiOff size={16} /> Slow or disconnected internet.
              </li>
              <li className="flex items-center gap-2">
                <ServerCrash size={16} /> Server downtime. Try again after a few seconds.
              </li>
              <li className="flex items-center gap-2">
                <LogInIcon size={16} /> Not logged in? <Link to="/login" className="underline" style={{ color: luckyColors.primary }}>Login here</Link>.
              </li>
            </ul>
          }
          className="mb-8 rounded-2xl shadow-lg border-0"
          style={{ backgroundColor: '#fffaf0' }}
        />

        <Title level={4} style={{ color: luckyColors.secondary }}>Supported File Types</Title>
        <Paragraph className="mb-4">
          We allow most common formats for convenience, but <Text delete>block dangerous extensions</Text> to protect our system:
        </Paragraph>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {['Images: jpg, jpeg, png, gif, bmp, webp, svg',
             'Documents: pdf, docx, xlsx, pptx, txt, csv',
             'Archives: zip, rar, 7z, tar.gz',
             'Media: mp3, mp4, mov, avi',
             'Code files: js, py, java, php, html'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <FileIcon size={16} /> {item}
            </li>
          ))}
        </ul>

        <Paragraph>
          <Text strong style={{ color: luckyColors.accent }}>Why block these?</Text> Infected executables and scripts (<Text code>.exe</Text>, <Text code>.bat</Text>, <Text code>.cmd</Text>, etc.) are common vectors for malware and hacking attempts. By blocking them, we reduce risk of viruses and unauthorized code execution on our servers and users' devices.
        </Paragraph>

        <div className="mt-8">
          <Title level={4} style={{ color: luckyColors.primary }}>Download Instructions</Title>
          <ol className="list-decimal pl-6 text-sm space-y-2">
            <li>Click the download icon <Download size={16} /> next to your file.</li>
            <li>By default, it will save as <Text code>myfilepdf</Text>. Rename it to <Text code>myfile.pdf</Text> before opening.</li>
            <li>Store your files safely and keep antivirus updated.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Text>Lucky Rat Numbers:</Text>
          {luckyNumbers.map(n => <Text key={n} className="px-2 py-1 rounded-full" style={{ backgroundColor: luckyColors.accent, color: '#000' }}>{n}</Text>)}
        </div>

        <div className="mt-12">
          <Link to="/files">
            <Button shape="round" size="large" icon={<FileIcon />} style={{ backgroundColor: luckyColors.primary, borderColor: luckyColors.primary, color: '#fff' }}>
              Go to Your Files
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Panel: Illustration or Extra Content */}
      <div className="hidden lg:flex flex-1 justify-center items-center p-6">
        {/* Placeholder for an SVG or graphic illustration */}
        <img src="/assets/secure_download.svg" alt="Secure Download" className="max-w-md animate-fadeIn" />
      </div>
    </div>
  );
}

