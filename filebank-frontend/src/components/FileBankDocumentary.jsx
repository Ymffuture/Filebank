import React from 'react';
import { Collapse, Typography } from 'antd';
import { Helmet } from 'react-helmet';
import { FileText, ShieldCheck, Globe, UploadCloud, LockKeyhole } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function FileBankDocumentary() {
  return (
    <div className="min-h-screen bg-[#fff] py-10 px-4">
      <Helmet>
        <title>FileBank Documentary | Qurovex</title>
        <meta name="description" content="Discover how FileBank saves your important files, like CVs, certificates, and more, accessible anytime, anywhere with just internet access." />
      </Helmet>

      <main className="mx-auto max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <Typography>
          <Title level={2} className="text-center text-[#1E90FF] mb-6">The Story & Vision of FileBank</Title>
          
          <Paragraph className="text-lg">
            <Text strong>FileBank</Text> is a purpose-built cloud storage solution developed by <Text code>Qurovex Institute</Text> to safeguard and streamline access to your most critical documents. These include CVs, academic certificates, professional licenses, legal papers, and personal credentials — the files that define your identity, achievements, and opportunities. Unlike traditional cloud storage platforms, FileBank is engineered to ensure these vital documents are always available to you, securely stored, and accessible from any device with an internet connection.
          </Paragraph>

          <Paragraph className="text-lg">
            Consider a scenario where you’re preparing for an impromptu job interview without access to your personal device, or you’re traveling abroad and need to present a qualification certificate on short notice. <Text mark>FileBank exists to solve these challenges</Text>. It transcends basic storage, acting as a digital vault that provides reliability and peace of mind in an unpredictable world.
          </Paragraph>

          <Paragraph className="text-lg">
            This page serves as an evolving documentary, detailing the philosophy behind FileBank, its practical applications, and the benefits it offers. Our aim is to create a comprehensive resource — targeting over 5,000 words — that grows with user feedback and new insights, guiding you to integrate FileBank seamlessly into your digital life.
          </Paragraph>

          <Title level={3} className="mt-8">Our Mission</Title>
          <Paragraph className="text-lg">
            At FileBank, our mission is to <Text strong>empower individuals with peace of mind</Text> by offering a secure, dependable, and universally accessible repository for life’s essential documents. Whether you’re a student pursuing academic opportunities, a professional advancing your career, or an individual preparing for unexpected circumstances, FileBank is designed to be your trusted partner in document management.
          </Paragraph>

          <Collapse accordion size="large" className="mt-6" bordered={false}>
            <Panel header={<span><UploadCloud className="inline mr-2" size={16}/> What is FileBank?</span>} key="1">
              <Paragraph className="text-lg">
                FileBank is a specialized cloud-based platform tailored for managing personal documents that matter most — think CVs, identification scans, academic certificates, and legal agreements. Unlike broad-spectrum cloud storage services that handle everything from photos to videos, FileBank hones in on simplicity, speed, and security for these critical files.
              </Paragraph>
              <Paragraph className="text-lg">
                Built on robust infrastructure, FileBank leverages trusted partners like Cloudinary for file storage and MongoDB Atlas for database management. All data is encrypted at rest and in transit using advanced standards, ensuring your documents remain protected. The platform’s lightweight design means no software installation is required — simply access it through any web browser, making it an effortless addition to your routine.
              </Paragraph>
              <Paragraph className="text-lg">
                The benefit? FileBank eliminates the clutter and complexity of generic storage solutions, offering a focused, intuitive experience that prioritizes your most important documents. It’s about having what you need, when you need it, without the hassle.
              </Paragraph>
            </Panel>

            <Panel header={<span><ShieldCheck className="inline mr-2" size={16}/> Why FileBank is Safe</span>} key="2">
              <Paragraph className="text-lg">
                At FileBank, security isn’t an afterthought — it’s the foundation. We recognize that the documents you entrust to us are often irreplaceable and highly sensitive, which is why we’ve implemented a multi-layered security framework to protect them.
              </Paragraph>
              <Paragraph className="text-lg">
                Every file is encrypted using AES-256 encryption both at rest and during transmission, secured further by SSL/TLS protocols. Access to your account is safeguarded with hashed authentication tokens and stringent access controls, ensuring that only you — or those you explicitly authorize — can view your documents. Unlike some platforms, your files are never publicly accessible by default.
              </Paragraph>
              <Paragraph className="text-lg">
                Beyond technical measures, we conduct regular security audits and penetration testing to proactively identify and address vulnerabilities. Our commitment extends to privacy: FileBank does not monetize your data through advertising or third-party sharing. We’re here to protect your information, not profit from it.
              </Paragraph>
              <Paragraph className="text-lg">
                The advantage for you is clear: with FileBank, you gain a secure haven for your documents, backed by transparency and trust. It’s a solution that lets you focus on your goals without worrying about data breaches or privacy violations.
              </Paragraph>
            </Panel>

            <Panel header={<span><FileText className="inline mr-2" size={16}/> What You Should Store</span>} key="3">
              <Paragraph className="text-lg">
                FileBank is optimized for documents that are challenging to replace or critical in pivotal moments. These are the files that can unlock opportunities or resolve emergencies. We recommend storing:
              </Paragraph>
              <ul className="list-disc pl-6 text-lg">
                <li><strong>CVs and Resumes:</strong> Keep your professional profile updated and ready for job applications or networking events.</li>
                <li><strong>Academic Certificates:</strong> Store diplomas, transcripts, and credentials for education or employment verification.</li>
                <li><strong>Professional Licenses:</strong> Maintain digital copies of certifications that affirm your expertise.</li>
                <li><strong>ID Scans:</strong> Securely back up passports or IDs for emergencies, with caution to protect sensitive data.</li>
                <li><strong>Proof of Address:</strong> Save utility bills or leases for administrative needs like opening accounts or moving.</li>
                <li><strong>Legal Contracts:</strong> Preserve signed agreements or NDAs for quick reference or legal disputes.</li>
              </ul>
              <Paragraph className="text-lg">
                Storing these in FileBank ensures they’re organized and instantly accessible, saving you time and stress when it counts. It’s about preparedness — having the right document at the right moment can make all the difference.
              </Paragraph>
            </Panel>

            <Panel header={<span><LockKeyhole className="inline mr-2" size={16}/> How to Protect Your Files</span>} key="4">
              <Paragraph className="text-lg">
                While FileBank provides cutting-edge security, your habits amplify that protection. Here’s how to maximize the safety of your files:
              </Paragraph>
              <ul className="list-disc pl-6 text-lg">
                <li><strong>Strong Passwords:</strong> Use unique, complex passwords — a mix of letters, numbers, and symbols — and avoid reuse across platforms.</li>
                <li><strong>Two-Factor Authentication (2FA):</strong> Activate 2FA when available to add an extra barrier against unauthorized access.</li>
                <li><strong>Secure Credentials:</strong> Never share your FileBank login details; use built-in sharing features instead.</li>
                <li><strong>Safe Sharing:</strong> Opt for expiring links or recipient verification when sharing files, available in premium plans for enhanced control.</li>
                <li><strong>Monitor Activity:</strong> Regularly review your account for unusual activity to catch potential issues early.</li>
              </ul>
              <Paragraph className="text-lg">
                These practices, paired with FileBank’s tools, create a fortress around your documents. The benefit is confidence — knowing your files are as secure as your efforts to protect them.
              </Paragraph>
            </Panel>

            <Panel header={<span><Globe className="inline mr-2" size={16}/> Access Anywhere</span>} key="5">
              <Paragraph className="text-lg">
                FileBank’s standout feature is its universal accessibility. Whether you’re on a smartphone, tablet, laptop, or borrowed computer, your documents are just a login away — all you need is an internet connection.
              </Paragraph>
              <Paragraph className="text-lg">
                Our platform is engineered for efficiency, with a lightweight design that performs reliably even on low-bandwidth networks. This ensures you can retrieve your files in diverse situations — from a bustling airport to a remote village.
              </Paragraph>
              <Paragraph className="text-lg">
                The value here is freedom and flexibility. FileBank adapts to your life, delivering your documents wherever you are, without the need for specific hardware or software, making it an indispensable tool for modern living.
              </Paragraph>
            </Panel>
          </Collapse>

          <Title level={4} className="mt-8">Conclusion</Title>
          <Paragraph className="text-lg">
            FileBank is more than a storage platform — it’s a lifeline for your most valuable documents. By combining top-tier security, seamless accessibility, and a user-focused design, we aim to give you confidence and control in a fast-paced world.
          </Paragraph>
          <Paragraph className="text-lg">
            We invite you to make FileBank your go-to solution for document management. As this documentary evolves, expect more insights, tips, and real-world examples to enhance your experience.
          </Paragraph>

          <Paragraph type="secondary" className="text-center mt-6">
            This is a living document, set to expand beyond 5,000 words with ongoing updates to serve as your ultimate FileBank guide.
          </Paragraph>
        </Typography>
      </main>
    </div>
  );
}
