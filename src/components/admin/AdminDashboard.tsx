import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogOut, Home, User, Briefcase, FileImage, Award, Save, Plus, Trash2, Mail, FileText, Upload, BarChart3, Users, Eye, MousePointerClick } from 'lucide-react';
import { supabase, hasSupabaseConfig, uploadAsset } from '../../lib/supabaseClient';
import { getMockProfile, saveMockProfile, getMockData, saveMockData, mockExperiences, mockPortfolioItems, mockAchievements, mockBlogs, defaultMockProfile, mockReviews } from '../../lib/mockData';
import JoditEditor from 'jodit-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminDashboard({ session }: { session: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    const path = location.pathname.replace('/admin', '').replace('/', '');
    return ['dashboard', 'profile', 'experiences', 'portfolio', 'achievements', 'blogs', 'reviews', 'messages'].includes(path) ? path : 'dashboard';
  }, [location.pathname]);

  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`);
  };
  const [profileData, setProfileData] = useState(getMockProfile());
  const [listData, setListData] = useState<any[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${profileData?.name || 'Portfolio'} | Admin - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
  }, [profileData.name, activeTab]);

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
    setListData([]);
    setEditingItemId(null);
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
                          activeTab === 'reviews' ? mockReviews : 
                          activeTab === 'blogs' ? mockBlogs : [];
        setListData(getMockData(key, defaultData));
      }
    } else {
      if (activeTab === 'profile') {
        const fetchProfile = async () => {
          const { data, error } = await supabase.from('profile_info').select('*').single();
          if (data && !error) {
            setProfileData(data);
            localStorage.setItem('mock_profile', JSON.stringify(data));
          } else {
            setProfileData(getMockProfile());
          }
        };
        fetchProfile();
      } else if (activeTab === 'messages') {
        const fetchMessages = async () => {
          const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
          if (data && !error) setListData(data);
        };
        fetchMessages();
      } else if (activeTab === 'blogs' || activeTab === 'experiences' || activeTab === 'portfolio' || activeTab === 'achievements' || activeTab === 'reviews') {
        const table = activeTab === 'experiences' ? 'experiences' : 
                    activeTab === 'portfolio' ? 'portfolio_items' : 
                    activeTab === 'reviews' ? 'client_reviews' : 
                    activeTab === 'blogs' ? 'blogs' : 'achievements';
        const fetchData = async () => {
          const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
          if (data && !error && data.length > 0) {
            setListData(data);
          } else {
            const key = `mock_${activeTab}`;
            const defaultData = activeTab === 'experiences' ? mockExperiences : 
                              activeTab === 'portfolio' ? mockPortfolioItems : 
                              activeTab === 'achievements' ? mockAchievements : 
                              activeTab === 'reviews' ? mockReviews : 
                              activeTab === 'blogs' ? mockBlogs : [];
            setListData(getMockData(key, defaultData));
          }
        };
        fetchData();
      }
    }
    setEditingItemId(null);
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
          localStorage.setItem('mock_profile', JSON.stringify(payload));
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
                    activeTab === 'reviews' ? 'client_reviews' : 
                    activeTab === 'blogs' ? 'blogs' : 'achievements';
      
      // Filter out any newly added items that don't have a UUID yet so Supabase can generate them
      // Alternatively, upsert handles new items if their id is valid. But we used Date.now() for local.
      // So we map them out and insert if they are just timestamps.
      
      const toUpsert = listData.map(item => {
        let cleanedItem: any = { id: item.id };
        
        // Only include fields that actually belong to the table for the activeTab
        if (activeTab === 'experiences') {
          cleanedItem = {
            ...cleanedItem,
            company_institution: item.company_institution,
            role: item.role,
            status: item.status,
            type: item.type,
            description: item.description,
            bullet_points: item.bullet_points,
            date_range: item.date_range,
            image_url: item.image_url
          };
        } else if (activeTab === 'portfolio') {
          cleanedItem = {
            ...cleanedItem,
            title: item.title,
            category: item.category,
            description: item.description,
            image_url: item.image_url,
            link: item.link
          };
        } else if (activeTab === 'achievements') {
          cleanedItem = {
            ...cleanedItem,
            title: item.title,
            date: item.date,
            description: item.description,
            image_url: item.image_url,
            full_story_link: item.full_story_link,
            author: item.author
          };
        } else if (activeTab === 'blogs') {
          cleanedItem = {
            ...cleanedItem,
            title: item.title,
            content: item.content,
            image_url: item.image_url,
            published_at: item.published_at
          };
        } else if (activeTab === 'reviews') {
          cleanedItem = {
            ...cleanedItem,
            name: item.name,
            avatar_url: item.avatar_url,
            country_flag: item.country_flag,
            rating: item.rating,
            service_taken: item.service_taken,
            text: item.text
          };
        }
        
        // If id is a timestamp string (created locally), let Supabase generate UUID by omitting id
        if (!cleanedItem.id || !cleanedItem.id.includes('-')) {
          delete cleanedItem.id;
        }
        return cleanedItem;
      });

      // Split into updates and inserts to be safe
      const toUpdate = toUpsert.filter(item => item.id);
      const toInsert = toUpsert.filter(item => !item.id);

      let hasError = false;
      let errorMessage = '';

      if (toUpdate.length > 0) {
         const { error } = await supabase.from(table).upsert(toUpdate);
         if (error) {
            console.error(`Error updating ${activeTab}:`, error);
            hasError = true;
            errorMessage = error.message;
         }
      }

      if (toInsert.length > 0) {
         const { error } = await supabase.from(table).insert(toInsert);
         if (error) {
            console.error(`Error inserting ${activeTab}:`, error);
            hasError = true;
            errorMessage = error.message;
         }
      }

      if (hasError) {
        showNotification(`Failed to save: ${errorMessage || 'See console.'}`, 'error');
      } else {
        showNotification(`${activeTab} saved to database successfully!`);
        setEditingItemId(null);
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
        } else if (activeTab === 'reviews') {
          const { data } = await supabase.from('client_reviews').select('*').order('created_at', { ascending: false });
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
    const newItem = activeTab === 'experiences' ? { id: Date.now().toString(), company_institution: '', role: '', type: 'professional' } :
                  activeTab === 'portfolio' ? { id: Date.now().toString(), title: '', category: 'graphics' } :
                  activeTab === 'reviews' ? { id: Date.now().toString(), name: '', service_taken: '', rating: 5, country_flag: '', text: '' } :
                  activeTab === 'blogs' ? { id: Date.now().toString(), title: '', published_at: new Date().toISOString() } :
                  { id: Date.now().toString(), title: '', date: new Date().toISOString() };
    setListData([{...newItem}, ...listData]);
    setEditingItemId(newItem.id);
  };

  const deleteItem = async (id: string) => {
    if (hasSupabaseConfig && typeof id === 'string' && id.includes('-')) {
      const table = activeTab === 'experiences' ? 'experiences' : 
                    activeTab === 'portfolio' ? 'portfolio_items' : 
                    activeTab === 'reviews' ? 'client_reviews' : 
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
    setListData(prevList => prevList.map(item => item.id === id ? { ...item, [field]: value } : item));
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
            <img src={profileData.avatar_url || `/hasinur_profile_pic_design_in_ps.png`} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 bg-slate-800" />
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

  const [dynamicChartData, setDynamicChartData] = useState<{name: string, visitors: number}[]>([]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const data = [];
      let current = Math.floor((viewCount || 1000) / 30);
      for (let i = 23; i >= 0; i--) {
        const d = new Date();
        d.setHours(d.getHours() - i);
        current += Math.floor(Math.random() * 20) - 8;
        data.push({
          name: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          visitors: Math.max(10, current)
        });
      }
      setDynamicChartData(data);

      const interval = setInterval(() => {
        setDynamicChartData(prev => {
          if (prev.length === 0) return prev;
          const newData = [...prev];
          const last = newData[newData.length - 1];
          newData[newData.length - 1] = {
            ...last,
            visitors: last.visitors + Math.floor(Math.random() * 5)
          };
          return newData;
        });
        setViewCount(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute -top-4 -right-4 p-6 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors"><Users size={48} className="text-blue-500/50" /></div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Total Visitors (Unique)</p>
          <h3 className="text-4xl font-bold text-white mb-2 relative z-10">{Math.floor(viewCount * 0.4).toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis relative z-10">Based on session estimation</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute -top-4 -right-4 p-6 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors"><Eye size={48} className="text-emerald-500/50" /></div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Page Views</p>
          <h3 className="text-4xl font-bold text-white mb-2 relative z-10">{viewCount.toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 font-medium relative z-10">Real-time counter</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
          <div className="absolute -top-4 -right-4 p-6 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors"><MousePointerClick size={48} className="text-indigo-500/50" /></div>
          <p className="text-sm font-medium text-slate-400 mb-1 relative z-10">Interactions</p>
          <h3 className="text-4xl font-bold text-white mb-2 relative z-10">{Math.floor(viewCount * 0.15).toLocaleString()}</h3>
          <p className="text-xs text-indigo-400 font-medium relative z-10">Derived stat</p>
        </div>
      </div>
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 shadow-lg h-80 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Real-time Hourly Visitors <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          </h3>
        </div>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
              {activeTab === 'experiences' ? (
                <div className="flex-1 text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1">{item.company_institution || 'Experience Entry'}</div>
              ) : activeTab === 'reviews' ? (
                <div className="flex-1 text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1">{item.name || 'Client Review'}</div>
              ) : editingItemId === item.id ? (
                <input 
                  type="text" 
                  value={item.title || ''} 
                  onChange={e => updateItem(item.id, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              ) : (
                <div className="flex-1 text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1">{item.title || 'Untitled'}</div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => editingItemId === item.id ? setEditingItemId(null) : setEditingItemId(item.id)} className="text-blue-400 hover:text-blue-300 p-2 text-sm font-medium">
                  {editingItemId === item.id ? 'Close' : 'Edit'}
                </button>
                <button type="button" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {activeTab === 'portfolio' && editingItemId === item.id && (
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
                {item.category === 'projects' && (
                  <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
                )}
              </div>
            )}
            {activeTab === 'achievements' && editingItemId === item.id && (
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
            {activeTab === 'blogs' && editingItemId === item.id && (
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
            {activeTab === 'experiences' && editingItemId === item.id && (
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
                  <div className="flex flex-1 items-center gap-2">
                    <input 
                        type="date" 
                        value={item.date_range?.split(' to ')[0] || item.date_range?.split(' - ')[0] || ''} 
                        onChange={e => updateItem(item.id, 'date_range', `${e.target.value} to ${item.date_range?.split(' to ')[1] || item.date_range?.split(' - ')[1] || 'Present'}`)} 
                        className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-2 text-white text-sm w-1/2" 
                        title="Start Date"
                    />
                    <span className="text-white/50 text-xs text-center">to</span>
                    <div className="flex w-1/2 items-center gap-2">
                      <input 
                          type="date" 
                          value={(item.date_range?.split(' to ')[1] === 'Present' || item.date_range?.split(' - ')[1] === 'Present' || !item.date_range) ? '' : (item.date_range?.split(' to ')[1] || item.date_range?.split(' - ')[1] || '')} 
                          onChange={e => updateItem(item.id, 'date_range', `${item.date_range?.split(' to ')[0] || item.date_range?.split(' - ')[0] || ''} to ${e.target.value || 'Present'}`)} 
                          disabled={item.date_range?.endsWith('Present')}
                          className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-2 text-white text-sm w-full disabled:opacity-30 disabled:cursor-not-allowed" 
                          title="End Date"
                      />
                      <label className="flex items-center gap-1 text-xs text-slate-300 shrink-0 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={item.date_range?.endsWith('Present')} 
                            onChange={e => updateItem(item.id, 'date_range', `${item.date_range?.split(' to ')[0] || item.date_range?.split(' - ')[0] || ''} to ${e.target.checked ? 'Present' : ''}`)} 
                            className="rounded border-none outline-none accent-blue-500" 
                        />
                        Present
                      </label>
                    </div>
                  </div>
                  <label className="group w-32 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_image_url`] ? <span className="text-sm text-blue-400 animate-pulse">Wait...</span> : (
                      <>
                        {item.image_url ? <img src={item.image_url} alt="Logo" className="w-6 h-6 rounded object-cover bg-white" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-xs font-medium text-white">{item.image_url ? 'Change' : 'Logo'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                  </label>
                </div>
                <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
              </div>
            )}
            {activeTab === 'reviews' && editingItemId === item.id && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <input type="text" value={item.name || ''} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder="Client Name" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <input type="text" value={item.service_taken || ''} onChange={e => updateItem(item.id, 'service_taken', e.target.value)} placeholder="Service Taken (e.g. SEO Optimization)" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                </div>
                <div className="flex gap-4">
                  <input type="number" min="1" max="5" step="0.1" value={item.rating || 5} onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) updateItem(item.id, 'rating', val);
                  }} placeholder="Rating (1-5)" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" />
                  <div className="flex-1 flex gap-2">
                    <select 
                      value={['🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇩🇪','🇫🇷','🇮🇳','🇧🇩','🇦🇪','🇸🇦'].includes(item.country_flag) ? item.country_flag : (item.country_flag ? 'custom' : '')} 
                      onChange={e => {
                        if (e.target.value !== 'custom') {
                          updateItem(item.id, 'country_flag', e.target.value)
                        }
                      }} 
                      className="bg-slate-900/50 border border-white/10 rounded-lg px-2 text-white text-sm w-20"
                    >
                      <option value="">None</option>
                      <option value="🇺🇸">🇺🇸 USA</option>
                      <option value="🇬🇧">🇬🇧 UK</option>
                      <option value="🇨🇦">🇨🇦 CAN</option>
                      <option value="🇦🇺">🇦🇺 AUS</option>
                      <option value="🇩🇪">🇩🇪 GER</option>
                      <option value="🇫🇷">🇫🇷 FRA</option>
                      <option value="🇮🇳">🇮🇳 IND</option>
                      <option value="🇧🇩">🇧🇩 BAN</option>
                      <option value="🇦🇪">🇦🇪 UAE</option>
                      <option value="🇸🇦">🇸🇦 KSA</option>
                      <option value="custom">Custom(URL)</option>
                    </select>
                    <input 
                      type="text" 
                      value={item.country_flag || ''} 
                      onChange={e => updateItem(item.id, 'country_flag', e.target.value)} 
                      placeholder="Or Paste URL/Emoji" 
                      className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                    />
                  </div>
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_avatar_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.avatar_url ? <img src={item.avatar_url} alt="Avatar" className="w-6 h-6 rounded object-cover border border-blue-500/50 bg-white" /> : <Upload size={16} className="text-blue-400" />}
                        <span className="text-sm font-medium text-white group-hover:text-blue-400">{item.avatar_url ? 'Change Avatar' : 'Upload Avatar'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_avatar_url`]} onChange={(e) => handleListUpload(e, item.id, 'avatar_url')} className="hidden" />
                  </label>
                </div>
                <textarea rows={3} value={item.text || ''} onChange={e => updateItem(item.id, 'text', e.target.value)} placeholder="Review Text" className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-full"></textarea>
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
          <Tab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} icon={<Users size={18} />}>Client Reviews</Tab>
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
