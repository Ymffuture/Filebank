import React from 'react';
import { Collapse, Typography, Card } from 'antd';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar';
import { FileText, ShieldCheck, Globe, UploadCloud, LockKeyhole } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function FileBankDocumentary() {
  return (
    <div className="min-h-screen bg-[#E1EEFA]">
      <Helmet>
        <title>FileBank Documentary | Qurovex</title>
        <meta name="description" content="Discover how FileBank saves your important files, like CVs, certificates, and more, accessible anytime, anywhere with just internet access." />
      </Helmet>

      <Navbar />
      <main className="container mx-auto py-10 px-4">
        <Card className="shadow-lg rounded-xl bg-white">
          <Typography>
            <Title level={2} className="text-center text-[#1E90FF]">The Story & Vision of FileBank</Title>
            
            <Paragraph>
              <Text strong>FileBank</Text> is not just another cloud storage service. It is a life tool designed by <Text code>Qurovex Institute</Text> to ensure your most critical documents — CVs, certificates, legal papers, licenses, and credentials — are always available to you when you need them, wherever you are, on any device with internet access.
            </Paragraph>

            <Paragraph>
              Imagine being stranded without your phone, needing your CV for a job interview, or urgently needing to prove a qualification abroad. <Text mark>FileBank was built for these moments</Text>. It’s more than storage — it’s your digital safe.
            </Paragraph>

            <Title level={3}>Our Mission</Title>
            <Paragraph>
              At FileBank, our mission is simple: <Text strong>give people peace of mind</Text> by providing a secure, reliable, and accessible vault for life’s most important documents. From the student applying for scholarships to the professional navigating their career, FileBank stands ready as your document companion.
            </Paragraph>

            <Paragraph>
              This documentary page shares our philosophy, best practices, and how you can make FileBank a trusted part of your digital life. (Word count goal: 5000+ words — use this as a living document to guide your users!)
            </Paragraph>

            <Collapse accordion size="large" className="mt-6">
              <Panel header={<span><UploadCloud className="inline mr-2" size={16}/> What is FileBank?</span>} key="1">
                <Paragraph>
                  FileBank is a cloud-based platform designed for personal file management, especially focused on crucial documents like CVs, ID scans, certificates, and legal paperwork. Unlike generic cloud storage services, FileBank emphasizes simplicity, speed, and security for these document types.
                </Paragraph>
                <Paragraph>
                  We use trusted infrastructure partners (like Cloudinary + MongoDB Atlas) with data encrypted both at rest and in transit. Our app is lightweight so you can access files on any browser — no installation needed.
                </Paragraph>
              </Panel>

              <Panel header={<span><ShieldCheck className="inline mr-2" size={16}/> Why FileBank is Safe</span>} key="2">
                <Paragraph>
                  Security is our top priority. We use SSL, hashed tokens, and strict access control. Your documents are not public; only you (and anyone you explicitly share with) can access them.
                </Paragraph>
                <Paragraph>
                  Regular security audits and penetration testing ensure that our system is resilient to threats. We do not sell your data. FileBank exists to protect, not exploit.
                </Paragraph>
              </Panel>

              <Panel header={<span><FileText className="inline mr-2" size={16}/> What You Should Store</span>} key="3">
                <Paragraph>
                  We recommend storing files that are difficult or impossible to replace:
                  <ul>
                    <li>CV / Resume</li>
                    <li>Academic certificates</li>
                    <li>Professional licenses</li>
                    <li>ID scans (with caution)</li>
                    <li>Proof of address documents</li>
                    <li>Legal contracts</li>
                  </ul>
                  These are documents that can save you in emergencies or opportunities.
                </Paragraph>
              </Panel>

              <Panel header={<span><LockKeyhole className="inline mr-2" size={16}/> How to Protect Your Files</span>} key="4">
                <Paragraph>
                  Use a strong password, enable 2FA when available, and avoid sharing your login credentials. FileBank gives you the tools, but your digital habits are key to security.
                </Paragraph>
                <Paragraph>
                  When sharing files, prefer links that expire or require recipient verification. We support these advanced options in premium tiers.
                </Paragraph>
              </Panel>

              <Panel header={<span><Globe className="inline mr-2" size={16}/> Access Anywhere</span>} key="5">
                <Paragraph>
                  All you need is internet access — no need for your personal device. FileBank is fully responsive and works on mobile browsers, tablets, laptops, or desktop PCs.
                </Paragraph>
                <Paragraph>
                  We aim to be the most lightweight and accessible document vault, with low bandwidth consumption so you can connect even on slow connections.
                </Paragraph>
              </Panel>
            </Collapse>

            <Title level={4} className="mt-6">Conclusion</Title>
            <Paragraph>
              FileBank is more than technology — it’s peace of mind in a chaotic world. Join us in making your important documents always accessible, secure, and organized.
            </Paragraph>

            <Paragraph type="secondary">
              This page is a living document. We will expand with security tips, case studies, and user stories. Stay tuned as we cross 5000+ words and beyond.
            </Paragraph>
          </Typography>
        </Card>
      </main>
    </div>
  );
}

