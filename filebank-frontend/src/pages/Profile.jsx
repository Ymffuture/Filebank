import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ArrowLeftIcon, PencilSquareIcon, XMarkIcon, CheckIcon, EnvelopeIcon, IdentificationIcon, ShieldExclamationIcon, UserIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/solid';
import api from '../api/fileApi';
import Nav from '../components/Navbar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picture: null });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [fallbackId, setFallbackId] = useState(null);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setForm({
        name: res.data.displayName || res.data.name,
        email: res.data.email,
        picture: res.data.picture,
      });
      localStorage.setItem('filebankUser', JSON.stringify(res.data));
    } catch {
      enqueueSnackbar('Failed to load profile', { variant: 'default' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.googleId) {
      setFallbackId("APP-" + Math.random().toString(36).substring(2, 10).toUpperCase());
    }
  }, [user?.googleId]);

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (file) formData.append('image', file);

      setUploading(true);
      const res = await api.put('/auth/update-profile', formData);
      setUser(res.data.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.data));
      enqueueSnackbar('Profile updated successfully', { variant: 'info' });
      setEditing(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Server error', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-2 bg-gray-50">
        <Spin size="large" style={{ color: "#202124" }} />
        <span className="text-gray-600 animate-pulse">
          <span className="font-bold text-gray-900">{user?.displayName || "Your"} </span>
          profile loading...
        </span>
      </div>
    );
  }

  return (
    <>
      <Nav />
      {/* Account Status Section */}
      <div className={`mx-4 mt-4 rounded-xl shadow-sm border p-5 transition-all duration-300 
        ${user.isBlocked 
          ? "bg-red-50 border-red-300 text-red-700" 
          : user.hasIssue 
            ? "bg-yellow-50 border-yellow-300 text-yellow-700" 
            : "bg-green-50 border-green-300 text-green-700"}`}>
        <div className="flex items-center gap-3 mb-2">
          <ShieldExclamationIcon
            className={`h-6 w-6 ${
              user.isBlocked ? "text-red-600" : user.hasIssue ? "text-yellow-600" : "text-green-600"
            }`}
          />
          <span className="text-lg font-semibold">Account Status</span>
        </div>
        {user.isBlocked ? (
          <p className="flex items-center gap-2">
            <XMarkIcon className="h-5 w-5 text-red-500" />
            Your account has been <strong>blocked</strong>. Please contact support for assistance.
          </p>
        ) : user.hasIssue ? (
          <p className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />
            Your account has <strong>issues</strong>. Kindly resolve them to avoid restrictions.
          </p>
        ) : (
          <p className="flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-500" />
            Your account is in <strong>good standing</strong>. No issues detected.
          </p>
        )}
        <div className="flex justify-around mt-4 text-sm">
          <div className="flex items-center gap-1">
            {user.hasIssue ? <XMarkIcon className="h-4 w-4 text-yellow-500" /> : <CheckIcon className="h-4 w-4 text-green-500" />}
            <span>Issue: {user.hasIssue ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center gap-1">
            {user.isBlocked ? <XMarkIcon className="h-4 w-4 text-red-500" /> : <CheckIcon className="h-4 w-4 text-green-500" />}
            <span>Blocked: {user.isBlocked ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:shadow-2xl">
          {/* Avatar + Edit Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={form.picture || "https://famacloud.vercel.app/filelogo.jpg"}
                alt="avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-gray-100 transition-transform group-hover:scale-105"
              />
              {editing && (
                <label className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 cursor-pointer shadow-lg border border-gray-200 hover:bg-gray-50 transition-all z-10">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setFile(f);
                      setForm({ ...form, picture: URL.createObjectURL(f) });
                    }}
                  />
                  <PencilSquareIcon className="h-5 w-5 text-gray-600 hover:text-indigo-600 transition" />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">Profile</h2>

          {/* Profile Info */}
          {editing ? (
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 shadow-sm cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <CheckIcon className="h-5 w-5" />
                  {uploading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              {/* Name */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <UserIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Username</span>
                  <p className="text-gray-600">{user.displayName || user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <EnvelopeIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Email</span>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Plan */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <TagIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Plan</span>
                  <p className="text-gray-600">{user.role?.toUpperCase() || "Please Login"}</p>
                </div>
              </div>

              {/* App ID */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <IdentificationIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">App Id</span>
                  <p className="text-gray-600">{user.googleId || fallbackId}</p>
                </div>
              </div>

              {/* Issue / Blocked */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <ShieldExclamationIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Issue / Blocked</span>
                  <p className="text-gray-600">
                    {user.hasIssue ? "Yes" : "No"} / {user.isBlocked ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900">Member since</span>
                  <p className="text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(true)}
                className
