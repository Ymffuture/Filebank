import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Spin } from "antd"; // loader only
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ShieldExclamationIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import api from "../api/fileApi";
import Nav from "../components/Navbar";

// Production-ready Profile component
// - polished UI inspired by modern SaaS products (cards, gradients, badges)
// - responsive layout, keyboard + screen reader friendly
// - optimistic local update and localStorage sync
// - image preview + client-side resize before upload
// - upload progress (if axios instance supports onUploadProgress)
// - graceful error handling and retries

const DEFAULT_AVATAR = "https://famacloud.vercel.app/filelogo.jpg";

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "-";
  }
}

async function resizeImageFile(file, maxWidth = 1024) {
  // Resize client-side to save bandwidth. Returns a Blob.
  if (!file || !file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const ratio = img.width / img.height;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(maxWidth / ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          // preserve original type if possible
          resolve(blob || file);
        }, file.type || "image/jpeg", 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", picture: null });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [fallbackId, setFallbackId] = useState(null);
  const mountedRef = useRef(true);
  const abortRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    fetchUser();
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      abortRef.current = new AbortController();
      const res = await api.get("/auth/me", { signal: abortRef.current.signal });
      if (!mountedRef.current) return;
      setUser(res.data);
      setForm((f) => ({ ...f, name: res.data.displayName || res.data.name, email: res.data.email, picture: res.data.picture }));
      localStorage.setItem("filebankUser", JSON.stringify(res.data));
    } catch (err) {
      console.error("Profile fetch error", err);
      enqueueSnackbar("Failed to load profile", { variant: "error" });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!user?.googleId) {
      setFallbackId("APP-" + Math.random().toString(36).substring(2, 10).toUpperCase());
    }
  }, [user?.googleId]);

  const handleFileChange = useCallback(async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // immediate preview
    const previewUrl = URL.createObjectURL(f);
    setForm((prev) => ({ ...prev, picture: previewUrl }));
    setFile(f);
  }, []);

  const handleCancelEdits = useCallback(() => {
    setEditing(false);
    // revoke preview URL if a new file was chosen
    if (file) {
      try {
        URL.revokeObjectURL(form.picture);
      } catch {}
      setFile(null);
    }
    // reset to original user
    setForm((f) => ({ ...f, name: user?.displayName || user?.name, email: user?.email, picture: user?.picture }));
  }, [file, form.picture, user]);

  const handleUpdate = useCallback(async () => {
    if (!user) return;
    if (!form.name || form.name.trim().length < 2) {
      enqueueSnackbar("Please enter a valid name", { variant: "warning" });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (file) {
        const resized = await resizeImageFile(file, 800);
        formData.append("image", resized, file.name);
      }

      // optimistic UI: update local state early
      const optimistic = { ...user, displayName: form.name, picture: form.picture || user.picture };
      setUser(optimistic);
      localStorage.setItem("filebankUser", JSON.stringify(optimistic));

      const res = await api.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.lengthComputable) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        },
      });

      setUser(res.data.data || res.data);
      localStorage.setItem("filebankUser", JSON.stringify(res.data.data || res.data));
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
      setEditing(false);
      setFile(null);
    } catch (err) {
      console.error("Update error", err);
      enqueueSnackbar(err.response?.data?.message || "Server error while updating profile", { variant: "error" });
      // revert optimistic update
      setUser(user);
      localStorage.setItem("filebankUser", JSON.stringify(user));
    } finally {
      if (mountedRef.current) {
        setUploading(false);
        setProgress(0);
      }
    }
  }, [user, form, file, enqueueSnackbar]);

  const copyAppId = useCallback(async () => {
    const id = user?.googleId || fallbackId;
    try {
      await navigator.clipboard.writeText(id);
      enqueueSnackbar("App ID copied to clipboard", { variant: "info" });
    } catch {
      enqueueSnackbar("Could not copy App ID", { variant: "default" });
    }
  }, [user, fallbackId, enqueueSnackbar]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("filebankUser");
      window.location.href = "/";
    } catch {
      enqueueSnackbar("Failed to logout", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  const downloadVCard = useCallback(() => {
    // minimal vCard generator
    const displayName = user?.displayName || user?.name || "";
    const email = user?.email || "";
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nEMAIL:${email}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayName || "contact"}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    enqueueSnackbar("vCard downloaded", { variant: "info" });
  }, [user, enqueueSnackbar]);

  if (loading || !user) {
    return (
      <div className="min-h-[100vh] flex flex-col">
        <Nav />
        <div className="flex flex-col justify-center items-center grow gap-4 py-20">
          <Spin size="large" />
          <div className="text-center">
            <div className="text-sm text-gray-500">{user?.displayName || "Your"} profile loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const planBadge = useMemo(() => {
    const role = user.role || "guest";
    const color = role.toLowerCase() === "admin" ? "bg-yellow-100 text-yellow-800" : role.toLowerCase() === "pro" ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800";
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{(role || "Member").toUpperCase()}</span>
    );
  }, [user.role]);

  return (
    <div className="min-h-[100vh] bg-gradient-to-tr from-white via-[#fbfbff] to-[#f7f9ff]">
      <Nav />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Avatar + meta */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={form.picture || user.picture || DEFAULT_AVATAR}
                    alt={`${user.displayName || user.name || "User"} avatar`}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                    onClick={() => setEditing(true)}
                  />

                  <div className="absolute -bottom-1 -right-1">
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-white p-2 rounded-full shadow-md border border-gray-100 hover:scale-[1.02] transition"
                      aria-label="Edit profile picture"
                      title="Edit picture"
                    >
                      <PencilSquareIcon className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Name + actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 justify-between">
                  <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 truncate">{user.displayName || user.name}</h1>
                    <div className="mt-1 flex items-center gap-3">
                      {planBadge}
                      <button
                        onClick={copyAppId}
                        className="text-xs px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition text-gray-600"
                        aria-label="Copy App ID"
                        title="Copy App ID"
                      >
                        {user.googleId || fallbackId}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditing((v) => !v)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={downloadVCard}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border text-gray-700 hover:shadow"
                      title="Download contact"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span className="text-sm">Contact</span>
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-indigo-500" />
                  <span className="truncate">{user.email}</span>
                </p>

                <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-indigo-300" />
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              {editing ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-1 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      aria-label="Full name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Profile image</label>
                    <div className="mt-2 flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border hover:bg-gray-100">
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        <span className="text-sm">Upload</span>
                      </label>

                      {form.picture && (
                        <div className="flex items-center gap-2">
                          <img src={form.picture} alt="preview" className="w-16 h-16 rounded-md object-cover border" />
                          <button
                            onClick={() => {
                              try { URL.revokeObjectURL(form.picture); } catch {}
                              setForm((f) => ({ ...f, picture: user.picture }));
                              setFile(null);
                            }}
                            className="text-sm px-3 py-2 bg-white border rounded-md"
                          >
                            Revert
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end pt-2">
                    <button className="px-4 py-2 rounded-xl bg-gray-100" onClick={handleCancelEdits}>
                      <XMarkIcon className="h-4 w-4 inline-block mr-2" /> Cancel
                    </button>

                    <button
                      onClick={handleUpdate}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60"
                    >
                      {uploading ? (
                        <span className="inline-flex items-center gap-2">
                          <Spin size="small" /> <span>Saving {progress ? `${progress}%` : ""}</span>
                        </span>
                      ) : (
                        <><CheckIcon className="h-4 w-4 inline-block mr-2" /> Save</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-2">
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm text-gray-700"><UserIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">Username:</span> <span>{user.displayName || user.name}</span></p>
                    <p className="flex items-center gap-2 text-sm text-gray-700"><EnvelopeIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">Email:</span> <span>{user.email}</span></p>
                    <p className="flex items-center gap-2 text-sm text-gray-700"><TagIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">Plan:</span> <span>{user.role || "Free"}</span></p>
                  </div>

                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm text-gray-700"><IdentificationIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">App ID</span> <button onClick={copyAppId} className="ml-2 text-xs px-2 py-1 rounded-md bg-gray-50">Copy</button></p>
                    <p className="flex items-center gap-2 text-sm text-gray-700"><ShieldExclamationIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">Issue / Blocked</span> <span>{user.hasIssue ? "Yes" : "No"} / {user.isBlocked ? "Yes" : "No"}</span></p>
                    <p className="flex items-center gap-2 text-sm text-gray-700"><CalendarIcon className="h-5 w-5 text-indigo-500" /> <span className="font-semibold">Member since</span> <span>{formatDate(user.createdAt)}</span></p>
                  </div>

                  <div className="md:col-span-2 mt-4 flex items-center gap-3">
                    <Link to="/dashboard" className="px-4 py-2 rounded-xl border bg-white hover:shadow"> <ArrowLeftIcon className="h-4 w-4 inline mr-2" /> Back</Link>
                    <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Edit profile</button>
                    <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Profile.propTypes = {};

