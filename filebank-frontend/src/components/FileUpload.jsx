import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Button, Alert, Progress } from "antd";
import { InfoCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { Helmet } from "react-helmet";
import Lottie from "lottie-react";
import uploadAnimation from "../assets/uploading.json";
import UploadIcon from "../assets/Upload.json";
import Successful from "../assets/Successful.json";
import Failed from "../assets/Failed.json";
import pdfAnim from "../assets/PDF.json";
import api from "../api/fileApi";
import Stack from "./Stack";

export default function FileUpload({
  onUpload,
  currentUserFileCount = 0,
  userRole,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
const [eta, setEta] = useState(null);
const [startTime, setStartTime] = useState(null);

  // Config
  const MAX_FILES = 5;
  const MAX_SIZE_MB = 5;

  // Allowed file MIME types
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/tiff",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
    // Text & Code
    "text/plain",
    "text/html",
    "text/css",
    "application/javascript",
    "application/json",
    "application/xml",
    "text/yaml",
    "text/markdown",
    "text/x-log",
    "text/x-python",
    "application/x-python-code",
    "application/typescript",
    "text/jsx",
    "text/x-jsx",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-7z-compressed",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    // CSV & Data
    "text/csv",
    "application/sql",
    // Fonts
    "font/ttf",
    "font/woff",
    "font/woff2",
    "application/font-woff",
    // Configs & Binary
    "text/x-shellscript",
    "text/x-config",
    "application/octet-stream",
  ];

  // Demo card images for stack animation
  const images = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
    },
  ];

  // Handle upload
  const handleSubmit = async () => {
    if (files.length === 0) {
      setMessage({ type: "error", text: "No files selected." });
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("file", f.originFileObj));

setUploading(true);
setProgress(0);
setEta(null);
setStartTime(Date.now());


    try {
      const res = await api.post("files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
  const percent = Math.floor((e.loaded * 100) / e.total);
  setProgress(percent);

  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const speed = e.loaded / elapsed; // bytes/sec
  const remaining = e.total - e.loaded;
  const secondsLeft = remaining / speed;

  if (!isNaN(secondsLeft) && isFinite(secondsLeft)) {
    // Format secondsLeft -> "2m 4s"
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = Math.floor(secondsLeft % 60);

    const formatted =
      minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    setEta(formatted);
  }
},


      });

      setMessage({
        type: "success",
        text: (
          <>
            Upload complete 100%.{" "}
            <Link
              to="/files"
              className="text-green-600 font-semibold hover:text-green-800"
            >
              <Button type="link" icon={<LinkOutlined />}>
                View Files
              </Button>
            </Link>
          </>
        ),
      });

      enqueueSnackbar("Upload successful!", { variant: "success" });
      setFiles([]);

      if (onUpload) onUpload(res.data);
    } catch (err) {
    
      setMessage({
        type: "error",
        text: (
          <>
            Something went wrong.{" "}
            <Link
              to="/help"
              className="text-green-600 font-semibold underline hover:text-green-800"
            >
              <Button type="link" icon={<InfoCircleOutlined />}>
                Learn more
              </Button>
            </Link>
          </>
        ),
      });
      enqueueSnackbar("Upload failed.", { variant: "error" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0s";

  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Add leading zero to seconds if less than 10
  const formattedSecs = secs < 10 ? `0${secs}` : secs;

  return `${minutes}m ${formattedSecs}s`;
};


  return (
    <>
      <Helmet>
        <title>Dashboard Upload Files | Famacloud</title>
        <meta
          name="description"
          content="Securely upload your files to Famacloud."
        />
      </Helmet>

      <div className="flex items-center justify-center min-h-screen">
        <div className="rounded-lg max-w-lg w-full shadow-lg p-4 bg-white dark:bg-gray-900">
          {/* Animation Section */}
          <div className="flex justify-center mb-4">
            {uploading ? (
              <Lottie
                animationData={uploadAnimation}
                loop
                style={{ width: 300, height: 300 }}
              />
            ) : message?.type === "success" ? (
              <Lottie
                animationData={Successful}
                loop={false}
                style={{ width: 300, height: 300 }}
              />
            ) : message?.type === "error" ? (
              <Lottie
                animationData={Failed}
                loop={false}
                style={{ width: 300, height: 300 }}
              />
            ) : (
              <Stack
                randomRotation
                sensitivity={50}
                sendToBackOnClick={false}
                cardDimensions={{ width: 300, height: 300 }}
                cardsData={images}
              />
            )}
          </div>

          {/* Upload Dragger */}
          <Upload.Dragger
            beforeUpload={(file, fileList) => {
              if (!allowedTypes.includes(file.type)) {
                enqueueSnackbar("Invalid file type", { variant: "warning" });
                return Upload.LIST_IGNORE;
              }

              if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
                enqueueSnackbar(
                  `File size exceeds ${MAX_SIZE_MB}MB limit.`,
                  { variant: "warning" }
                );
                return Upload.LIST_IGNORE;
              }

              if (fileList.length > MAX_FILES) {
                enqueueSnackbar(
                  `Maximum ${MAX_FILES} files allowed per upload.`,
                  { variant: "warning" }
                );
                return Upload.LIST_IGNORE;
              }

              return false; // prevent auto upload
            }}
            onChange={({ fileList }) => {
              let updatedList = fileList;

              if (userRole === "Free" && fileList.length > 1) {
                updatedList = [fileList[fileList.length - 1]];
                enqueueSnackbar(
                  "Free users can only upload one file per upload.",
                  { variant: "info" }
                );
              }

              setFiles(updatedList);
              setMessage(null);
            }}
            fileList={files}
            multiple={userRole !== "Free"}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true,
            }}
            disabled={uploading}
          >
            <div className="flex justify-center mb-4">
              <Lottie
                animationData={UploadIcon}
                loop={false}
                style={{ width: 150, height: 150 }}
              />
            </div>
            <p className="ant-upload-text font-semibold text-gray-700 dark:text-gray-200">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint text-gray-500 dark:text-gray-400">
              Supported: Images, Documents, Audio, Video, Archives, Code Files.
              Max size: {MAX_SIZE_MB}MB. (Max {MAX_FILES} Files per upload)
            </p>
          </Upload.Dragger>

          {/* Upload Button */}
          <div className="mt-6 flex justify-center">
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={uploading}
              disabled={uploading || files.length === 0}
            >
              {uploading ? "Uploading..." : "Start Upload"}
            </Button>
          </div>

          {/* Upload Progress */}
          {progress > 0 && (
  <div className="mt-4 text-center">
    <Progress percent={progress} />
    {eta && (
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        ⏱ Estimated time left: {formatTime(eta)}
      </p>
    )}
  </div>
)}


          {/* Alerts */}
          {message && (
            <Alert
              message={message.text}
              type={message.type}
              className="mt-4"
              closable
            />
          )}
        </div>
      </div>
    </>
  );
}

