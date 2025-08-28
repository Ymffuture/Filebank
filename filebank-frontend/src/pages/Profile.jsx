import React, { useEffect, useState } from 'react';
import { Spin } from 'antd'; // keep only loader
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ArrowLeftIcon, PencilSquareIcon, XMarkIcon, CheckIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import api from '../api/fileApi';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', picture: null });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

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
      enqueueSnackbar('Failed to load profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (file) formData.append('image', file);

      setUploading(true);

      const res = await api.put('/auth/update-profile', formData);
      setUser(res.data.data);
      localStorage.setItem('filebankUser', JSON.stringify(res.data.data));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      setEditing(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Server error', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-2">
        <Spin size="large" />
        <span className="text-gray-600">Famacloud profile loading...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4 bg-[#fafafa]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        
        {/* Avatar + Edit Image */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={form.picture || "https://via.placeholder.com/150"}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
            />
            {editing && (
  <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-lg border border-gray-200 hover:bg-gray-50 transition">
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
        <h2 className="text-center text-lg font-semibold mt-4">My Profile</h2>

        {/* Profile Info */}
        {editing ? (
          <div className="mt-6 space-y-4">
  {/* Name Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Full Name
    </label>
    <input
      type="text"
      placeholder="Enter your full name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
    />
  </div>

  {/* Email Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email Address
    </label>
    <input
      type="email"
      value={form.email}
      disabled
      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 shadow-sm cursor-not-allowed"
    />
  </div>

  {/* Action Buttons */}
  <div className="flex items-center justify-end gap-3 pt-2">
    <button
      onClick={() => setEditing(false)}
      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition-all"
    >
      <XMarkIcon className="h-5 w-5" />
      Cancel
    </button>
    <button
      onClick={handleUpdate}
      disabled={uploading}
      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-all"
    >
      <CheckIcon className="h-5 w-5" />
      {uploading ? "Saving..." : "Save"}
    </button>
  </div>
</div>
        ) : (
          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">Name:</span> {user.displayName || user.name}</p>
            <p className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4" /> {user.email}
            </p>
            <p><span className="font-semibold">Plan:</span> {user.role?.toUpperCase() || '-'}</p>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <PencilSquareIcon className="h-5 w-5" /> Edit Profile
            </button>

            <Link to="/dashboard">
              <button className="w-full mt-2 text-indigo-600 flex items-center justify-center gap-2">
                <ArrowLeftIcon className="h-5 w-5" /> Back to Dashboard
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

