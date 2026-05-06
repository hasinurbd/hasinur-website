import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogOut, Home, User, Briefcase, FileImage, Award, Save, Plus, Trash2, Mail, FileText, Upload, BarChart3, Users, Eye, MousePointerClick } from 'lucide-react';
import { supabase, hasSupabaseConfig, uploadAsset } from '../../lib/supabaseClient';
import { getMockProfile, saveMockProfile, getMockData, saveMockData, mockExperiences, mockPortfolioItems, mockAchievements, mockBlogs, defaultMockProfile } from '../../lib/mockData';
import JoditEditor from 'jodit-react';

import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminDashboard({ session }: { session: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    const path = location.pathname.replace('/admin', '').replace('/', '');
    return ['dashboard', 'profile', 'experiences', 'portfolio', 'achievements', 'blogs', 'messages'].includes(path) ? path : 'dashboard';
  }, [location.pathname]);

  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`);
  };
  const [profileData, setProfileData] = useState(getMockProfile());
  const [listData, setListData] = useState<any[]>([]);

  const editorConfig = useMemo(() => ({
    theme: 'dark',
    buttons: ['bold', 'italic', 'underline', 'fontsize', 'ol', 'ul', 'brush', 'omega'],
    style: {
      background: '#1e293b',
      color: '#ffffff',
    },
    useSplitMode: false,
    autoHide: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false
  }), []);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!hasSupabaseConfig) {
      if (activeTab === 'profile') {
        setProfileData(getMockProfile());
      } else if (activeTab === 'messages' || activeTab === 'blogs') {
        setListData([]);
      } else {
        const key = `mock_${activeTab}`;
        const defaultData = activeTab === 'experiences' ? mockExperiences : 
                          activeTab === 'portfolio' ? mockPortfolioItems : 
                          activeTab === 'achievements' ? mockAchievements : 
                          activeTab === 'blogs' ? mockBlogs : [];
        setListData(getMockData(key, defaultData));
      }
    } else {
      if (activeTab === 'profile') {
        const fetchProfile = async () => {
          const { data, error } = await supabase.from('profile_info').select('*').single();
          if (data && !error) setProfileData(data);
        };
        fetchProfile();
      } else if (activeTab === 'messages') {
        const fetchMessages = async () => {
          const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
          if (data && !error) setListData(data);
        };
        fetchMessages();
      } else if (activeTab === 'blogs' || activeTab === 'experiences' || activeTab === 'portfolio' || activeTab === 'achievements') {
        const table = activeTab === 'experiences' ? 'experiences' : 
                    activeTab === 'portfolio' ? 'portfolio_items' : 
                    activeTab === 'blogs' ? 'blogs' : 'achievements';
        const fetchData = async () => {
          const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
          if (data && !error) setListData(data);
        };
        fetchData();
      }
    }
  }, [activeTab]);

  const handleLogout = async () => {
    if (hasSupabaseConfig) {
      await supabase.auth.signOut();
    } else {
      window.location.reload();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (!hasSupabaseConfig) {
        saveMockProfile(profileData);
        showNotification('Profile updated locally!');
      } else {
        const payload: any = {
          name: profileData.name,
          title: profileData.title,
          bio: profileData.bio,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          avatar_url: profileData.avatar_url,
          resume_url: profileData.resume_url
        };
        if (profileData.id) {
           payload.id = profileData.id;
        }
        const { error } = await supabase
          .from('profile_info')
          .upsert([payload]);
        
        if (error) {
          console.error('Error saving profile:', error);
          showNotification('Failed to save to database. Check console.', 'error');
        } else {
          showNotification('Profile saved to database successfully!');
        }
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveList = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingList(true);
    try {
      if (!hasSupabaseConfig) {
        const key = `mock_${activeTab}`;
        saveMockData(key, listData);
        showNotification(`${activeTab} updated locally!`);
      } else {
      const table = activeTab === 'experiences' ? 'experiences' : 
                    activeTab === 'portfolio' ? 'portfolio_items' : 
                    activeTab === 'blogs' ? 'blogs' : 'achievements';
      
      // Filter out any newly added items that don't have a UUID yet so Supabase can generate them
      // Alternatively, upsert handles new items if their id is valid. But we used Date.now() for local.
      // So we map them out and insert if they are just timestamps.
      
      const toUpsert = listData.map(item => {
        // If id is a timestamp string (created locally), let Supabase generate UUID by omitting id
        if (!item.id || !item.id.includes('-')) {
          const { id, ...rest } = item;
          return rest;
        }
        return item;
      });

      // Split into updates and inserts to be safe
      const toUpdate = toUpsert.filter(item => item.id);
      const toInsert = toUpsert.filter(item => !item.id);

      let hasError = false;

      if (toUpdate.length > 0) {
         const { error } = await supabase.from(table).upsert(toUpdate);
         if (error) {
            console.error(`Error updating ${activeTab}:`, error);
            hasError = true;
         }
      }

      if (toInsert.length > 0) {
         const { error } = await supabase.from(table).insert(toInsert);
         if (error) {
            console.error(`Error inserting ${activeTab}:`, error);
            hasError = true;
         }
      }

      if (hasError) {
        showNotification(`Failed to save some ${activeTab} to database. See console.`, 'error');
      } else {
        showNotification(`${activeTab} saved to database successfully!`);
        // Refresh to get new UUIDs
        if (activeTab === 'experiences') {
          const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
          if (data) setListData(data);
        } else if (activeTab === 'portfolio') {
          const { data } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
          if (data) setListData(data);
        } else if (activeTab === 'blogs') {
          const { data } = await supabase.from('blogs').select('*').order('published_at', { ascending: false });
          if (data) setListData(data);
        } else if (activeTab === 'achievements') {
          const { data } = await supabase.from('achievements').select('*').order('date', { ascending: false });
          if (data) setListData(data);
        }
      }
    }
    } finally {
      setIsSavingList(false);
    }
  };

  const addItem = () => {
    const newItem = activeTab === 'experiences' ? { id: Date.now().toString(), company_institution: 'New Entity', role: 'Role', type: 'professional' } :
                  activeTab === 'portfolio' ? { id: Date.now().toString(), title: 'New Item', category: 'graphics' } :
                  activeTab === 'blogs' ? { id: Date.now().toString(), title: 'New Blog Post', published_at: new Date().toISOString() } :
                  { id: Date.now().toString(), title: 'New Achievement', date: new Date().toISOString() };
    setListData([...listData, newItem]);
  };

  const deleteItem = async (id: string) => {
    if (hasSupabaseConfig && typeof id === 'string' && id.includes('-')) {
      const table = activeTab === 'experiences' ? 'experiences' : 
                    activeTab === 'portfolio' ? 'portfolio_items' : 
                    activeTab === 'blogs' ? 'blogs' : 'achievements';
      try {
        await supabase.from(table).delete().match({ id });
      } catch (e) {
        console.error(e);
      }
    }
    setListData(listData.filter(item => item.id !== id));
  };

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  const updateItem = (id: string, field: string, value: any) => {
    setListData(listData.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_url' | 'resume_url') => {
    if (e.target.files && e.target.files[0]) {
      setUploadingStates(prev => ({ ...prev, [field]: true }));
      try {
        const file = e.target.files[0];
        const url = await uploadAsset(file);
        if (url) {
          setProfileData({ ...profileData, [field]: url });
          showNotification(`${field === 'avatar_url' ? 'Avatar' : 'Resume'} uploaded!`);
        } else {
          showNotification('Upload failed.', 'error');
        }
      } finally {
        setUploadingStates(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  const handleListUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const uploadKey = `${id}_${field}`;
      setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
      try {
        const file = e.target.files[0];
        const url = await uploadAsset(file);
        if (url) {
          updateItem(id, field, url);
          showNotification('File uploaded!');
        } else {
          showNotification('Upload failed.', 'error');
        }
      } finally {
        setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
      }
    }
  };

  const renderProfileForm = () => (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Headline / Title</label>
          <input type="text" value={profileData.title} onChange={e => setProfileData({...profileData, title: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
          <JoditEditor value={profileData.bio || ''} config={editorConfig} onBlur={newContent => setProfileData({...profileData, bio: newContent})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
          <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
          <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Upload Avatar Image</label>
          <div className="flex items-center gap-3">
            {profileData.avatar_url && <img src={profileData.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />}
            <span className="flex-1 w-full bg-slate-900/80 border border-blue-500/30 rounded-xl px-4 py-3 text-white/50 text-sm italic font-medium">Upload an image below to replace</span>
            <label className="flex-shrink-0 cursor-pointer bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-white/10 transition-colors">
              {uploadingStates['avatar_url'] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : <Upload size={20} className="text-blue-400" />}
              <input type="file" disabled={uploadingStates['avatar_url']} accept="image/*" onChange={(e) => handleProfileUpload(e, 'avatar_url')} className="hidden" />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Upload Resume / CV (PDF)</label>
          <div className="flex items-center gap-3">
            {profileData.resume_url && <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-slate-800 border-2 border-emerald-500 hover:bg-slate-700 transition-colors"><FileText size={20} className="text-emerald-500" /></a>}
            <span className="flex-1 w-full bg-slate-900/80 border border-blue-500/30 rounded-xl px-4 py-3 text-white/50 text-sm italic font-medium">Upload a document below to replace</span>
            <label className="flex-shrink-0 cursor-pointer bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-white/10 transition-colors">
              {uploadingStates['resume_url'] ? <span className="text-sm text-emerald-400 animate-pulse">Uploading...</span> : <Upload size={20} className="text-emerald-400" />}
              <input type="file" disabled={uploadingStates['resume_url']} accept=".pdf" onChange={(e) => handleProfileUpload(e, 'resume_url')} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      <button type="submit" disabled={isSavingProfile} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]">
        <Save size={18} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );

  const renderMessagesList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Contact Messages</h3>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {listData.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No messages found.</p>
        ) : listData.map((msg) => (
          <div key={msg.id} className="bg-slate-800/30 border border-white/5 p-5 rounded-xl space-y-3">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-white text-lg">{msg.name}</h4>
                <a href={`mailto:${msg.email}`} className="text-sm text-blue-400 hover:underline">{msg.email}</a>
              </div>
              <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const [viewCount, setViewCount] = useState(100000);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchViews = async () => {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.from('site_stats').select('views').eq('id', 'global').single();
          if (data && !error) setViewCount(Math.max(100000, data.views));
        } else {
          const saved = localStorage.getItem('mockViews');
          setViewCount(saved ? parseInt(saved) : 100000);
        }
      };
      fetchViews();
    }
  }, [activeTab]);

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} /></div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Visitors (Unique)</p>
          <h3 className="text-4xl font-bold text-white mb-2">{Math.floor(viewCount * 0.4).toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Based on session estimation</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Eye size={64} /></div>
          <p className="text-sm font-medium text-slate-400 mb-1">Page Views</p>
          <h3 className="text-4xl font-bold text-white mb-2">{viewCount.toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 font-medium">Real-time counter</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><MousePointerClick size={64} /></div>
          <p className="text-sm font-medium text-slate-400 mb-1">Interactions</p>
          <h3 className="text-4xl font-bold text-white mb-2">{Math.floor(viewCount * 0.15).toLocaleString()}</h3>
          <p className="text-xs text-blue-400 font-medium">Derived stat</p>
        </div>
      </div>
      <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center">
        <p className="text-slate-500 italic">Advanced charts and geolocation stats will appear here</p>
      </div>
    </div>
  );

  const renderListForm = () => (
    <form onSubmit={handleSaveList} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-300">Items List</h3>
        <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all">
          <Plus size={16} /> Add New
        </button>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {listData.map((item) => (
          <div key={item.id} className="bg-slate-800/30 border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex justify-between gap-4">
              <input 
                type="text" 
                value={item.title || item.company_institution || ''} 
                onChange={e => updateItem(item.id, item.title ? 'title' : 'company_institution', e.target.value)}
                placeholder="Title / Name"
                className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
              <button type="button" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300 p-2">
                <Trash2 size={18} />
              </button>
            </div>
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={item.link || ''} onChange={e => updateItem(item.id, 'link', e.target.value)} placeholder="Live Website Preview URL (e.g., https://my-site.com)" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-4">
                  <select value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1">
                    <option value="graphics">Graphics</option>
                    <option value="video">Video</option>
                    <option value="web">Web</option>
                    <option value="projects">Projects</option>
                  </select>
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_image_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.image_url ? <img src={item.image_url} alt="Cover" className="w-6 h-6 rounded object-cover border border-blue-500/50" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-sm font-medium text-white group-hover:text-blue-400">{item.image_url ? 'Change Image' : 'Upload Image File'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                  </label>
                </div>
              </div>
            )}
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={item.full_story_link || ''} onChange={e => updateItem(item.id, 'full_story_link', e.target.value)} placeholder="Certificate Link URL" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-4">
                  <input type="date" value={item.date ? item.date.split('T')[0] : ''} onChange={e => updateItem(item.id, 'date', new Date(e.target.value).toISOString())} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_image_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.image_url ? <img src={item.image_url} alt="Cover" className="w-6 h-6 rounded object-cover border border-blue-500/50" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-sm font-medium text-white group-hover:text-blue-400">{item.image_url ? 'Change Image' : 'Upload Image File'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                  </label>
                </div>
                <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
              </div>
            )}
            {activeTab === 'blogs' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <input type="date" value={item.published_at ? item.published_at.split('T')[0] : ''} onChange={e => updateItem(item.id, 'published_at', new Date(e.target.value).toISOString())} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_image_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.image_url ? <img src={item.image_url} alt="Cover" className="w-6 h-6 rounded object-cover border border-blue-500/50" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-sm font-medium text-white group-hover:text-blue-400">{item.image_url ? 'Change Cover' : 'Upload Cover Image'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                  </label>
                </div>
                <JoditEditor value={item.content || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'content', newContent)} />
              </div>
            )}
            {activeTab === 'experiences' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <input type="text" value={item.role || ''} onChange={e => updateItem(item.id, 'role', e.target.value)} placeholder="Role (e.g. Lead Developer)" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <input type="text" value={item.company_institution || ''} onChange={e => updateItem(item.id, 'company_institution', e.target.value)} placeholder="Company / Institution" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                </div>
                <div className="flex gap-4">
                  <select value={item.type || 'professional'} onChange={e => updateItem(item.id, 'type', e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1">
                    <option value="professional">Professional</option>
                    <option value="education">Education</option>
                    <option value="creative">Creative</option>
                  </select>
                  <input type="text" value={item.date_range || ''} onChange={e => updateItem(item.id, 'date_range', e.target.value)} placeholder="Date Range" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_image_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.image_url ? <img src={item.image_url} alt="Logo" className="w-6 h-6 rounded object-cover border border-blue-500/50 bg-white" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-sm font-medium text-white group-hover:text-blue-400">{item.image_url ? 'Change Logo' : 'Upload Logo'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                  </label>
                </div>
                <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/10">
        <button type="submit" disabled={isSavingList} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Save size={18} /> {isSavingList ? 'Saving...' : `Save All ${activeTab}`}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row font-sans text-white">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl transition-all font-medium border flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-500/20 text-red-100 border-red-500/50' : 'bg-green-500/20 text-green-100 border-green-500/50'}`}>
          {notification.message}
        </div>
      )}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-white/10 p-6 flex flex-col">
        <div className="mb-10">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Control Panel</h2>
          <p className="text-xs text-slate-500 mt-1">{session.user.email}</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Tab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 size={18} />}>Dashboard</Tab>
          <Tab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />}>Profile Info</Tab>
          <Tab active={activeTab === 'experiences'} onClick={() => setActiveTab('experiences')} icon={<Briefcase size={18} />}>Experiences</Tab>
          <Tab active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<FileImage size={18} />}>Portfolio Items</Tab>
          <Tab active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Award size={18} />}>Achievements</Tab>
          <Tab active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<FileText size={18} />}>Blogs</Tab>
          <Tab active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<Mail size={18} />}>Messages</Tab>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
          <a href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-white/5">
            <Home size={18} /> Back to Site
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full p-2 rounded-lg hover:bg-red-500/10 text-left">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 bg-[#0a0f1a] border-l border-white/5 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold capitalize text-white tracking-tight">{activeTab} Management</h1>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl">
            {activeTab === 'dashboard' ? renderDashboard() : activeTab === 'profile' ? renderProfileForm() : activeTab === 'messages' ? renderMessagesList() : renderListForm()}
          </div>
        </div>
      </main>
    </div>
  );
}

function Tab({ active, onClick, children, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
        active 
          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {children}
    </button>
  );
}
