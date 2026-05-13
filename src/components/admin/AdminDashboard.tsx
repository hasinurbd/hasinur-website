import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogOut, Home, User, Briefcase, FileImage, Award, Save, Plus, Trash2, Mail, FileText, Upload, BarChart3, Users, Eye, MousePointerClick, Heart, MessageSquare, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, hasSupabaseConfig, uploadAsset } from '../../lib/supabaseClient';
import { getMockProfile, saveMockProfile, getMockData, saveMockData, mockExperiences, mockPortfolioItems, mockAchievements, mockBlogs, defaultMockProfile, mockReviews } from '../../lib/mockData';
import JoditEditor from 'jodit-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../lib/ProfileContext';
import MultiImageHandler from './MultiImageHandler';

export default function AdminDashboard({ session }: { session: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, refreshProfile } = useProfile();

  const activeTab = useMemo(() => {
    const path = location.pathname.replace('/admin', '').replace('/', '');
    return ['dashboard', 'profile', 'experiences', 'portfolio', 'achievements', 'blogs', 'reviews', 'messages'].includes(path) ? path : 'dashboard';
  }, [location.pathname]);

  const TABS_CONFIG: Record<string, { table: string, label: string, orderBy: string }> = useMemo(() => ({
    experiences: { table: 'experiences', label: 'Experience', orderBy: 'start_date' },
    portfolio: { table: 'portfolio_items', label: 'Portfolio', orderBy: 'start_date' },
    achievements: { table: 'achievements', label: 'Achievements', orderBy: 'date' },
    blogs: { table: 'blogs', label: 'Blogs', orderBy: 'published_at' },
    reviews: { table: 'client_reviews', label: 'Reviews', orderBy: 'created_at' },
    messages: { table: 'messages', label: 'Messages', orderBy: 'created_at' }
  }), []);

  const [profileData, setProfileData] = useState(profile);
  const [listData, setListData] = useState<any[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [realtimeActivity, setRealtimeActivity] = useState<any[]>([]);

  useEffect(() => {
    setProfileData(profile);
  }, [profile]);

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
      } else if (TABS_CONFIG[activeTab] || activeTab === 'messages') {
        const key = `mock_${activeTab}`;
        const defaultDataMap: Record<string, any[]> = {
          experiences: mockExperiences,
          portfolio: mockPortfolioItems,
          achievements: mockAchievements,
          reviews: mockReviews,
          blogs: mockBlogs
        };
        const rawData = getMockData(key, defaultDataMap[activeTab] || []);
        // Local sorting
        const sortedData = [...rawData].sort((a, b) => {
          const getSortValue = (item: any) => {
            if (activeTab === 'experiences' && item.date_range?.toLowerCase().includes('present')) {
              return new Date(8640000000000000).getTime() + new Date(item.start_date || item.created_at || 0).getTime();
            }
            if (activeTab === 'experiences') {
               const parts = item.date_range?.split(' to ');
               if (parts?.length === 2) {
                 const end = new Date(parts[1]);
                 if (!isNaN(end.getTime())) return end.getTime();
               }
            }
            const d = item.date || item.published_at || item.start_date || item.created_at;
            return new Date(d || 0).getTime();
          };
          
          const valA = getSortValue(a);
          const valB = getSortValue(b);
          
          if (valB !== valA) return valB - valA;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        setListData(sortedData);
      }
    } else {
      if (activeTab === 'profile') {
        const fetchProfile = async () => {
          const { data, error } = await supabase.from('profile_info').select('*').single();
          if (data && !error) {
            setProfileData({ ...defaultMockProfile, ...data });
            localStorage.setItem('mock_profile', JSON.stringify({ ...defaultMockProfile, ...data }));
          } else {
            setProfileData(getMockProfile());
          }
        };
        fetchProfile();
      } else if (TABS_CONFIG[activeTab]) {
        const config = TABS_CONFIG[activeTab];
        const fetchData = async () => {
          // Attempt sorting by configured field
          const { data, error } = await supabase.from(config.table).select('*').order(config.orderBy, { ascending: false });
          
          let finalData = data;
          
          // If sorting fails (e.g. column missing), fallback to created_at
          if (error && error.message.includes('column')) {
            const { data: fallbackData } = await supabase.from(config.table).select('*').order('created_at', { ascending: false });
            finalData = fallbackData;
          }

          if (finalData && (finalData.length > 0 || activeTab === 'messages')) {
            // Apply refined client-side sorting for specific cases like "Present"
            const sorted = [...finalData].sort((a, b) => {
              const getSortValue = (item: any) => {
                if (activeTab === 'experiences' && item.date_range?.toLowerCase().includes('present')) {
                  return new Date(8640000000000000).getTime() + new Date(item.start_date || item.created_at || 0).getTime();
                }
                if (activeTab === 'experiences') {
                   const parts = item.date_range?.split(' to ');
                   if (parts?.length === 2) {
                     const end = new Date(parts[1]);
                     if (!isNaN(end.getTime())) return end.getTime();
                   }
                }
                const d = item[config.orderBy] || item.created_at;
                return new Date(d || 0).getTime();
              };
              
              const valA = getSortValue(a);
              const valB = getSortValue(b);
              
              if (valB !== valA) return valB - valA;
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
            setListData(sorted);
          } else {
            const key = `mock_${activeTab}`;
            const defaultDataMap: Record<string, any[]> = {
              experiences: mockExperiences,
              portfolio: mockPortfolioItems,
              achievements: mockAchievements,
              reviews: mockReviews,
              blogs: mockBlogs
            };
            const rawMock = getMockData(key, defaultDataMap[activeTab] || []);
            const sortedMock = [...rawMock].sort((a: any, b: any) => {
              if (activeTab === 'experiences') {
                const isOngoingA = a.date_range?.toLowerCase().includes('present');
                const isOngoingB = b.date_range?.toLowerCase().includes('present');
                if (isOngoingA && !isOngoingB) return -1;
                if (!isOngoingA && isOngoingB) return 1;
              }
              const d1 = a[config.orderBy] || a.created_at;
              const d2 = b[config.orderBy] || b.created_at;
              return new Date(d2 || 0).getTime() - new Date(d1 || 0).getTime();
            });
            setListData(sortedMock);
          }
        };
        fetchData();
      }
    }
    setEditingItemId(null);
  }, [activeTab, TABS_CONFIG]);

  const handleLogout = async () => {
    if (hasSupabaseConfig) {
      await supabase.auth.signOut();
    }
    navigate('/admin');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      saveMockProfile(profileData);
      
      if (hasSupabaseConfig) {
        const payload: any = {
          ...profileData,
          updated_at: new Date().toISOString()
        };
        // Always try to use ID 1 for single profile unless one exists
        if (!payload.id) payload.id = 1;

        const { error } = await supabase.from('profile_info').upsert([payload]);
        if (error) {
          console.error('Database save error:', error);
          showNotification('Saved locally, but failed to sync to cloud: ' + error.message, 'error');
        } else {
          await refreshProfile();
          showNotification('Profile updated successfully!');
        }
      } else {
        showNotification('Profile updated locally!');
      }
    } catch (err: any) {
      console.error('Profile save error:', err);
      showNotification('An unexpected error occurred', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveList = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingList(true);
    try {
      const key = `mock_${activeTab}`;
      saveMockData(key, listData);
      
      if (!hasSupabaseConfig) {
        showNotification(`${activeTab} updated locally!`);
        setEditingItemId(null);
      } else {
        const config = TABS_CONFIG[activeTab];
        if (!config || activeTab === 'messages') {
          if (activeTab === 'messages') showNotification('Messages are read-only from cloud.');
          return;
        }

        const toUpsert = listData.map(item => {
          const { created_at, ...cleanedItem } = item;
          if (!cleanedItem.id || !cleanedItem.id.toString().includes('-')) {
            delete cleanedItem.id;
          }
          return cleanedItem;
        });

        const { error } = await supabase.from(config.table).upsert(toUpsert, { onConflict: 'id' });

        if (error) {
          showNotification(`Failed to save: ${error.message}`, 'error');
        } else {
          showNotification(`${activeTab} updated & synced!`);
          setEditingItemId(null);
          const { data } = await supabase.from(config.table).select('*').order(config.orderBy, { ascending: false });
          if (data) {
            const sorted = [...data].sort((a, b) => {
              const getSortValue = (item: any) => {
                if (activeTab === 'experiences' && item.date_range?.toLowerCase().includes('present')) {
                  return new Date(8640000000000000).getTime() + new Date(item.start_date || item.created_at || 0).getTime();
                }
                if (activeTab === 'experiences') {
                   const parts = item.date_range?.split(' to ');
                   if (parts?.length === 2) {
                     const end = new Date(parts[1]);
                     if (!isNaN(end.getTime())) return end.getTime();
                   }
                }
                const d = item[config.orderBy] || item.created_at;
                return new Date(d || 0).getTime();
              };
              
              const valA = getSortValue(a);
              const valB = getSortValue(b);
              
              if (valB !== valA) return valB - valA;
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
            setListData(sorted);
          }
        }
      }
    } finally {
      setIsSavingList(false);
    }
  };

    const addItem = () => {
    const defaultDataMap: Record<string, any> = {
      experiences: { company_institution: '', role: '', type: 'professional', bullet_points: [], start_date: new Date().toISOString(), subject: '', created_at: new Date().toISOString() },
      portfolio: { title: '', category: 'graphics', likes: 0, comments: [], start_date: new Date().toISOString(), created_at: new Date().toISOString() },
      reviews: { name: '', service_taken: '', rating: 5, country_flag: '', text: '', created_at: new Date().toISOString() },
      blogs: { title: '', published_at: new Date().toISOString(), likes: 0, comments: [], created_at: new Date().toISOString() },
      achievements: { title: '', date: new Date().toISOString(), likes: 0, comments: [], created_at: new Date().toISOString() }
    };
    const newItem = { id: Date.now().toString(), ...(defaultDataMap[activeTab] || { title: '', likes: 0, comments: [], created_at: new Date().toISOString() }) };
    setListData([newItem, ...listData]);
    setEditingItemId(newItem.id);
  };

  const deleteItem = async (id: string) => {
    if (hasSupabaseConfig && typeof id === 'string' && id.includes('-') && TABS_CONFIG[activeTab]) {
      try {
        await supabase.from(TABS_CONFIG[activeTab].table).delete().match({ id });
      } catch (e) {
        // Silent recovery
      }
    }
    setListData(listData.filter(item => item.id !== id));
  };

  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  const updateItem = (id: string, field: string, value: any) => {
    setListData(prevList => prevList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState<string | null>(null);

  const moveItemInArray = (id: string, field: string, fromIndex: number, toIndex: number) => {
    const item = listData.find(i => i.id === id);
    if (!item) return;
    const arr = [...(item[field] || (item.image_url ? [item.image_url] : []))];
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return;
    const [removed] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, removed);
    
    // Create updates object
    const updates: any = { [field]: arr };
    if (field === 'gallery' && toIndex === 0) {
      updates.image_url = arr[0];
    }
    
    setListData(prevList => prevList.map(it => it.id === id ? { ...it, ...updates } : it));
    setDraggedIdx(null);
    setDragOverIdx(null);
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
          <input type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Headline / Title</label>
          <input type="text" value={profileData.title || ''} onChange={e => setProfileData({...profileData, title: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
          <JoditEditor value={profileData.bio || ''} config={editorConfig} onBlur={newContent => setProfileData({...profileData, bio: newContent})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input type="email" value={profileData.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
          <input type="text" value={profileData.phone || ''} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
          <input type="text" value={profileData.location || ''} onChange={e => setProfileData({...profileData, location: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Upload Avatar Image</label>
          <div className="flex items-center gap-3">
            <img src={profileData.avatar_url || `https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png`} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 bg-slate-800" />
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
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <h4 className="md:col-span-2 text-sm font-bold text-blue-400 uppercase tracking-widest">Social Links</h4>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Facebook URL</label>
            <input type="text" value={profileData.facebook_url || ''} onChange={e => setProfileData({...profileData, facebook_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Instagram URL</label>
            <input type="text" value={profileData.instagram_url || ''} onChange={e => setProfileData({...profileData, instagram_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">LinkedIn URL</label>
            <input type="text" value={profileData.linkedin_url || ''} onChange={e => setProfileData({...profileData, linkedin_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Behance URL</label>
            <input type="text" value={profileData.behance_url || ''} onChange={e => setProfileData({...profileData, behance_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Twitter URL</label>
            <input type="text" value={profileData.twitter_url || ''} onChange={e => setProfileData({...profileData, twitter_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">YouTube URL</label>
            <input type="text" value={profileData.youtube_url || ''} onChange={e => setProfileData({...profileData, youtube_url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
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

  const [stats, setStats] = useState({
    portfolio: 0,
    experiences: 0,
    blogs: 0,
    messages: 0,
    reviews: 0,
    achievements: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (hasSupabaseConfig) {
        try {
          const [p, e, b, m, r, a] = await Promise.all([
            supabase.from('portfolio_items').select('likes', { count: 'exact' }),
            supabase.from('experiences').select('*', { count: 'exact', head: true }),
            supabase.from('blogs').select('likes', { count: 'exact' }),
            supabase.from('messages').select('*', { count: 'exact', head: true }),
            supabase.from('client_reviews').select('*', { count: 'exact', head: true }),
            supabase.from('achievements').select('likes', { count: 'exact' }),
          ]);

          const calculateLikes = (res: any) => {
            if (res.error) return 0;
            return res.data?.reduce((acc: number, curr: any) => acc + (curr.likes || 0), 0) || 0;
          };

          const totalLikes = calculateLikes(p) + calculateLikes(b) + calculateLikes(a);

          setStats({
            portfolio: p.count || 0,
            experiences: e.count || 0,
            blogs: b.count || 0,
            messages: m.count || 0,
            reviews: r.count || 0,
            achievements: a.count || 0,
            totalLikes
          });
        } catch (err) {
          console.error('Error fetching admin stats:', err);
        }
      } else {
        const pLikes = mockPortfolioItems.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        const bLikes = mockBlogs.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        const aLikes = mockAchievements.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        setStats({
          portfolio: mockPortfolioItems.length,
          experiences: mockExperiences.length,
          blogs: mockBlogs.length,
          messages: getMockData('mock_messages', []).length,
          reviews: mockReviews.length,
          achievements: mockAchievements.length,
          totalLikes: pLikes + bLikes + aLikes
        });
      }
    };
    fetchStats();

    // Fetch and Set Real-time Activity
    const fetchRecentActivity = async () => {
      if (!hasSupabaseConfig) {
        setRealtimeActivity([
          { id: '1', type: 'Experience', text: 'New Experience: Lead Developer at HQ', time: 'Just now', icon: <Briefcase size={12} className="text-blue-400" />, created_at: new Date().toISOString() },
          { id: '2', type: 'Project', text: 'New Portfolio: Minimalist Branding', time: '5m ago', icon: <FileImage size={12} className="text-emerald-400" />, created_at: new Date(Date.now() - 300000).toISOString() },
          { id: '3', type: 'Blog', text: 'New Blog: Future of Social Media', time: '1h ago', icon: <FileText size={12} className="text-pink-400" />, created_at: new Date(Date.now() - 3600000).toISOString() }
        ]);
        return;
      }

      try {
        const [p, e, b, m, r, a] = await Promise.all([
          supabase.from('portfolio_items').select('id, title, created_at, start_date').order('created_at', { ascending: false }).limit(3),
          supabase.from('experiences').select('id, company_institution, role, created_at, start_date').order('created_at', { ascending: false }).limit(3),
          supabase.from('blogs').select('id, title, created_at, published_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('messages').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('client_reviews').select('id, name, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('achievements').select('id, title, created_at, date').order('created_at', { ascending: false }).limit(3),
        ]);

        const combined: any[] = [];
        const formatItem = (item: any, type: string, displayTitle: string, icon: any) => ({
          id: item.id,
          type,
          text: `${type}: ${displayTitle}`,
          created_at: item.created_at || item.published_at || item.date || item.start_date,
          icon
        });

        if (p.data) p.data.forEach(i => combined.push(formatItem(i, 'Project', i.title, <FileImage size={12} className="text-indigo-400" />)));
        if (e.data) e.data.forEach(i => combined.push(formatItem(i, 'Experience', `${i.role} at ${i.company_institution}`, <Briefcase size={12} className="text-blue-400" />)));
        if (b.data) b.data.forEach(i => combined.push(formatItem(i, 'Blog', i.title, <FileText size={12} className="text-pink-400" />)));
        if (m.data) m.data.forEach(i => combined.push(formatItem(i, 'Message', `From ${i.name}`, <Mail size={12} className="text-emerald-400" />)));
        if (r.data) r.data.forEach(i => combined.push(formatItem(i, 'Review', `By ${i.name}`, <Award size={12} className="text-amber-400" />)));
        if (a.data) a.data.forEach(i => combined.push(formatItem(i, 'Achievement', i.title, <Award size={12} className="text-purple-400" />)));

        setRealtimeActivity(combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10));
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      }
    };

    fetchRecentActivity();

    // Real-time Subscriptions
    if (hasSupabaseConfig && activeTab === 'dashboard') {
      const channels = ['portfolio_items', 'experiences', 'blogs', 'messages', 'client_reviews', 'achievements'].map(table => 
        supabase.channel(`public:${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchRecentActivity();
          fetchStats(); // Update stats too
        }).subscribe()
      );
      return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
    }
  }, [activeTab]);

  const renderDashboard = () => {
    const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
    const pieData = [
      { name: 'Projects', value: stats.portfolio },
      { name: 'Works', value: stats.experiences },
      { name: 'Milestones', value: stats.achievements },
      { name: 'Blogs', value: stats.blogs },
    ].filter(d => d.value > 0);

    const barData = [
      { name: 'Msgs', value: stats.messages },
      { name: 'Reviews', value: stats.reviews },
    ];

    const getTimeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    };

    return (
      <div className="space-y-6">
        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Site Traffic', value: viewCount.toLocaleString(), trend: '+12.5%', icon: <Eye className="text-blue-400" />, color: 'blue' },
            { label: 'Engagement', value: stats.totalLikes.toLocaleString(), trend: 'Growing', icon: <Heart className="text-red-400" />, color: 'red' },
            { label: 'Messages', value: stats.messages, trend: '+3', icon: <Mail className="text-emerald-400" />, color: 'emerald' },
            { label: 'Showcase Items', value: stats.portfolio, trend: 'Active', icon: <Briefcase className="text-indigo-400" />, color: 'indigo' },
          ].map((kpi, i) => (
            <motion.div 
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-${kpi.color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                  {kpi.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.color === 'blue' || kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tighter mt-1">{kpi.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Main Charts & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col min-h-[420px]"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Visitor Velocity
                </h4>
                <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">Real-time traffic patterns over 24h</p>
              </div>
              <div className="flex bg-slate-900/50 rounded-full p-1 border border-white/5">
                <button className="px-3 py-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 rounded-full">LIVE</button>
                <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-300">24H</button>
              </div>
            </div>
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '11px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    labelStyle={{ opacity: 0.5, marginBottom: '4px' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col"
          >
            <h4 className="text-lg font-bold text-white tracking-tight mb-6">Recent Activity</h4>
            <div className="space-y-6 flex-1">
              {realtimeActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin"></div>
                  <span className="text-xs uppercase font-black tracking-widest">Listening...</span>
                </div>
              ) : realtimeActivity.map((activity) => (
                <div key={activity.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-white/5 last:before:hidden">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center z-10 hover:border-blue-500/50 transition-colors">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium mb-1 line-clamp-1">{activity.text}</p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{getTimeAgo(activity.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-6"
          >
            <div className="w-1/2 h-full min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ display: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Content Map</h5>
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="lg:col-span-2 bg-slate-800/40 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col"
          >
             <div className="flex justify-between items-center mb-6">
               <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inbound Performance</h5>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Messages</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Reviews</span>
                 </div>
               </div>
             </div>
             <div className="flex-1 w-full min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: -30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={12}>
                      {barData.map((_entry, index) => (
                        <Cell key={`bar-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderListForm = () => (
    <form onSubmit={handleSaveList} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-300">
          {activeTab === 'blogs' ? 'Published Blogs' : 
           activeTab === 'reviews' ? 'Client Feedback' : 
           activeTab === 'portfolio' ? 'Showcase Items' : 
           activeTab === 'achievements' ? 'Milestone List' : 'Experience History'}
        </h3>
        <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/20">
          <Plus size={16} /> Create New
        </button>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {listData.map((item) => (
          <div key={item.id} className="bg-slate-800/30 border border-white/5 p-4 rounded-xl space-y-4">
            <div className="flex justify-between gap-4">
              {activeTab === 'experiences' ? (
                <div className="flex-1 text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1 sm:flex items-center gap-2">
                  <span>{item.company_institution || 'Experience Entry'}</span>
                  {item.subject && <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-white/5 rounded border border-white/5">{item.subject}</span>}
                </div>
              ) : activeTab === 'reviews' ? (
                <div className="flex-1 text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1">{item.name || 'Client Review'}</div>
              ) : editingItemId === item.id ? (
                <div className="flex-1 bg-slate-900/10 rounded-lg border border-white/5 px-2 py-1 flex items-center">
                   <span className="text-slate-500 text-[10px] font-black uppercase px-2">Editing:</span>
                   <span className="text-white font-bold truncate">{item.title || item.name || item.company_institution || 'Untitled'}</span>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold px-3 py-2 bg-slate-900/50 rounded-lg border border-white/5 line-clamp-1 flex items-center justify-between gap-4">
                    <span>{item.title || 'Untitled'}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.likes > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase">
                          <Heart size={10} fill="currentColor" /> {item.likes}
                        </div>
                      )}
                      {item.comments?.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase">
                           <MessageSquare size={10} /> {item.comments.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
                <div className="flex gap-2 items-center">
                  <button 
                    type="button" 
                    onClick={async () => {
                      // Save this specific item
                      const key = `mock_${activeTab}`;
                      const currentLocalData = getMockData(key, []);
                      const updatedLocalData = currentLocalData.map((d: any) => d.id === item.id ? item : d);
                      saveMockData(key, updatedLocalData);

                      if (hasSupabaseConfig) {
                        const table = activeTab === 'experiences' ? 'experiences' : 
                                      activeTab === 'portfolio' ? 'portfolio_items' : 
                                      activeTab === 'reviews' ? 'client_reviews' : 
                                      activeTab === 'blogs' ? 'blogs' : 'achievements';
                        
                        let cleanedItem: any = { ...item };
                        if (!cleanedItem.id || !cleanedItem.id.toString().includes('-')) {
                          delete cleanedItem.id;
                        }

                        setIsSavingList(true);
                        try {
                          const { error } = await supabase.from(table).upsert([cleanedItem]);
                          if (error) showNotification('Sync error: ' + error.message, 'error');
                          else showNotification('Item saved & synced!');
                        } finally {
                          setIsSavingList(false);
                        }
                      } else {
                        showNotification('Item saved locally!');
                      }
                      setEditingItemId(null);
                    }} 
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20 transition-all"
                  >
                    <Save size={12} /> Save
                  </button>
                  <button type="button" onClick={() => editingItemId === item.id ? setEditingItemId(null) : setEditingItemId(item.id)} className="text-blue-400 hover:text-blue-300 p-2 text-sm font-medium">
                    {editingItemId === item.id ? 'Close' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
            </div>
            {activeTab === 'portfolio' && editingItemId === item.id && (
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Project Title</label>
                    <input type="text" value={item.title || ''} onChange={e => updateItem(item.id, 'title', e.target.value)} placeholder="e.g. Minimalist Branding" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Project Date</label>
                    <input type="date" value={item.start_date ? item.start_date.split('T')[0] : ''} onChange={e => updateItem(item.id, 'start_date', new Date(e.target.value).toISOString())} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Live Link / Source</label>
                    <input type="text" value={item.link || ''} onChange={e => updateItem(item.id, 'link', e.target.value)} placeholder="https://..." className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-black text-slate-500 ml-1">Visual Gallery (Multi-Upload)</label>
                    <div className="grid grid-cols-4 gap-2">
                       {(item.gallery || (item.image_url ? [item.image_url] : [])).map((url: string, imgIdx: number) => (
                         <div 
                           key={imgIdx} 
                           draggable
                           onDragStart={(e) => {
                             setDraggedIdx(imgIdx);
                             e.dataTransfer.setData('fromIdx', imgIdx.toString());
                             e.dataTransfer.effectAllowed = 'move';
                           }}
                           onDragOver={(e) => {
                             e.preventDefault();
                             setDragOverIdx(imgIdx);
                           }}
                           onDragLeave={() => setDragOverIdx(null)}
                           onDrop={(e) => {
                             e.preventDefault();
                             const fromIdx = parseInt(e.dataTransfer.getData('fromIdx'));
                             if (!isNaN(fromIdx)) moveItemInArray(item.id, 'gallery', fromIdx, imgIdx);
                           }}
                           className={`relative aspect-square rounded-xl overflow-hidden border transition-all group bg-slate-800 cursor-move 
                             ${dragOverIdx === imgIdx ? 'border-blue-500 scale-105 z-10 shadow-xl shadow-blue-500/20' : 'border-white/10'}
                             ${draggedIdx === imgIdx ? 'opacity-40 grayscale' : 'opacity-100'}`}
                         >
                           <img src={url} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                           <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const currentGallery = item.gallery || (item.image_url ? [item.image_url] : []);
                                 const newGallery = currentGallery.filter((_: any, i: number) => i !== imgIdx);
                                 updateItem(item.id, 'gallery', newGallery);
                                 if (imgIdx === 0) updateItem(item.id, 'image_url', newGallery[0] || '');
                               }}
                               className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg"
                               title="Delete"
                             >
                               <Trash2 size={12} />
                             </button>
                             
                             <div className="flex flex-col gap-1">
                               {imgIdx > 0 && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); moveItemInArray(item.id, 'gallery', imgIdx, imgIdx - 1); }}
                                   className="p-1 bg-white/10 text-white rounded hover:bg-blue-600 transition-colors"
                                   title="Move Left"
                                 >
                                   <ChevronLeft size={10} />
                                 </button>
                               )}
                               {imgIdx < (item.gallery || [item.image_url]).length - 1 && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); moveItemInArray(item.id, 'gallery', imgIdx, imgIdx + 1); }}
                                   className="p-1 bg-white/10 text-white rounded hover:bg-blue-600 transition-colors"
                                   title="Move Right"
                                 >
                                   <ChevronRight size={10} />
                                 </button>
                               )}
                             </div>

                             {imgIdx > 0 && (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   const gallery = [...(item.gallery || [item.image_url])];
                                   [gallery[imgIdx], gallery[0]] = [gallery[0], gallery[imgIdx]];
                                   updateItem(item.id, 'gallery', gallery);
                                   updateItem(item.id, 'image_url', gallery[0]);
                                 }}
                                 className="p-1.5 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                 title="Set as Cover"
                               >
                                 <Plus size={12} className="rotate-45" />
                               </button>
                             )}
                           </div>
                           {imgIdx === 0 && (
                             <div className="absolute bottom-0 left-0 right-0 bg-blue-600 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white">Cover</div>
                           )}
                         </div>
                       ))}
                       <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                         {uploadingStates[`${item.id}_gallery`] ? (
                           <div className="flex flex-col items-center">
                             <Upload size={16} className="text-blue-500 animate-bounce" />
                             <span className="text-[7px] font-black uppercase text-blue-400 mt-1">Syncing</span>
                           </div>
                         ) : (
                           <>
                             <Plus size={20} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                             <span className="text-[8px] font-black uppercase text-slate-600 mt-1">Add Photo</span>
                           </>
                         )}
                         <input
                           type="file"
                           className="hidden"
                           accept="image/*"
                           disabled={uploadingStates[`${item.id}_gallery`]}
                           onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               setUploadingStates(prev => ({ ...prev, [`${item.id}_gallery`]: true }));
                               const url = await uploadAsset(file);
                               if (url) {
                                 const currentGallery = item.gallery || (item.image_url ? [item.image_url] : []);
                                 const newGallery = [...currentGallery, url];
                                 updateItem(item.id, 'gallery', newGallery);
                                 if (!item.image_url) updateItem(item.id, 'image_url', url);
                               }
                               setUploadingStates(prev => ({ ...prev, [`${item.id}_gallery`]: false }));
                             }
                           }}
                         />
                       </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Categorization</label>
                      <div className="flex gap-2">
                        <select 
                          value={['graphics', 'video', 'web', 'projects'].includes(item.category) ? item.category : 'custom'} 
                          onChange={e => { if (e.target.value !== 'custom') updateItem(item.id, 'category', e.target.value) }} 
                          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-32 shrink-0"
                        >
                          <option value="graphics">Graphics</option>
                          <option value="video">Video</option>
                          <option value="web">Web</option>
                          <option value="projects">Projects</option>
                          <option value="custom">Custom...</option>
                        </select>
                        <input 
                          type="text" 
                          value={item.category || ''} 
                          onChange={e => updateItem(item.id, 'category', e.target.value)} 
                          placeholder="Subtitle (e.g. Logo Design)" 
                          className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Tools / Skills (Comma Separated)</label>
                      <input 
                        type="text" 
                        value={(item.tags || []).join(', ')} 
                        onChange={e => updateItem(item.id, 'tags', e.target.value.split(',').map(t => t.trim()))} 
                        placeholder="Photoshop, Illustrator, Figma" 
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Deep Details / Content</label>
                  <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
                </div>
              </div>
            )}
            {activeTab === 'achievements' && editingItemId === item.id && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Title</label>
                    <input type="text" value={item.title || ''} onChange={e => updateItem(item.id, 'title', e.target.value)} placeholder="Achievement Title" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Issuer / Author</label>
                    <input type="text" value={item.author || ''} onChange={e => updateItem(item.id, 'author', e.target.value)} placeholder="e.g. itel Official" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Certificate / Story Link</label>
                  <input type="text" value={item.full_story_link || ''} onChange={e => updateItem(item.id, 'full_story_link', e.target.value)} placeholder="Certificate Link URL" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Date Achieved</label>
                    <input type="date" value={item.date ? item.date.split('T')[0] : ''} onChange={e => updateItem(item.id, 'date', new Date(e.target.value).toISOString())} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(item.id + '_ach_main');
                        }}
                        onDragLeave={() => setIsDraggingLogo(null)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDraggingLogo(null);
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const uploadKey = `${item.id}_image_url`;
                            setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
                            try {
                              const url = await uploadAsset(file);
                              if (url) {
                                updateItem(item.id, 'image_url', url);
                                showNotification('Image uploaded via Drop!');
                              }
                            } finally {
                              setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
                            }
                          }
                        }}
                        className={`group flex-1 ${isDraggingLogo === item.id + '_ach_main' ? 'bg-blue-600/20 border-blue-600 ring-2 ring-blue-500' : 'bg-slate-800 hover:bg-slate-700 border-white/10'} p-2 rounded-lg border transition-all flex items-center justify-center gap-2 relative min-h-[40px]`}
                      >
                        {uploadingStates[`${item.id}_image_url`] ? (
                          <span className="text-sm text-blue-400 animate-pulse">Uploading...</span>
                        ) : (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                              {item.image_url ? (
                                <img src={item.image_url} alt="Cover" className="w-8 h-8 rounded object-contain" />
                              ) : (
                                <Upload size={16} className="text-blue-400" />
                              )}
                              <span className="text-sm font-medium text-white group-hover:text-blue-400">
                                {item.image_url ? 'Change Image (or Drop Here)' : 'Upload Image (or Drop Here)'}
                              </span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                disabled={uploadingStates[`${item.id}_image_url`]} 
                                onChange={(e) => handleListUpload(e, item.id, 'image_url')} 
                                className="hidden" 
                              />
                            </label>
                            {item.image_url && (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateItem(item.id, 'image_url', '');
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Remove Image"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                </div>
                <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
                
                <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                  <label className="block text-sm font-bold text-blue-400 uppercase tracking-wide">Image Gallery (Multi-Photo - Drag to Reorder)</label>
                  <div className="grid grid-cols-5 gap-2">
                     {(item.gallery || (item.image_url ? [item.image_url] : [])).map((url: string, imgIdx: number) => (
                       <div 
                         key={imgIdx} 
                         draggable
                         onDragStart={(e) => {
                           setDraggedIdx(imgIdx);
                           e.dataTransfer.setData('fromIdx', imgIdx.toString());
                           e.dataTransfer.effectAllowed = 'move';
                         }}
                         onDragOver={(e) => {
                           e.preventDefault();
                           setDragOverIdx(imgIdx);
                         }}
                         onDragLeave={() => setDragOverIdx(null)}
                         onDrop={(e) => {
                           e.preventDefault();
                           const fromIdx = parseInt(e.dataTransfer.getData('fromIdx'));
                           if (!isNaN(fromIdx)) moveItemInArray(item.id, 'gallery', fromIdx, imgIdx);
                         }}
                         className={`relative aspect-square rounded-xl overflow-hidden border transition-all group bg-slate-800 cursor-move
                           ${dragOverIdx === imgIdx ? 'border-blue-500 scale-105 z-10 shadow-xl shadow-blue-500/20' : 'border-white/10'}
                           ${draggedIdx === imgIdx ? 'opacity-40 grayscale' : 'opacity-100'}`}
                       >
                         <img src={url} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                         <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               const currentGallery = item.gallery || (item.image_url ? [item.image_url] : []);
                               const newGallery = currentGallery.filter((_: any, i: number) => i !== imgIdx);
                               updateItem(item.id, 'gallery', newGallery);
                               if (imgIdx === 0) updateItem(item.id, 'image_url', newGallery[0] || '');
                             }}
                             className="p-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg"
                           >
                             <Trash2 size={12} />
                           </button>
                           
                           <div className="flex flex-col gap-1">
                             {imgIdx > 0 && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); moveItemInArray(item.id, 'gallery', imgIdx, imgIdx - 1); }}
                                 className="p-0.5 bg-white/10 text-white rounded hover:bg-blue-600 transition-colors"
                               >
                                 <ChevronLeft size={10} />
                               </button>
                             )}
                             {imgIdx < (item.gallery || [item.image_url]).length - 1 && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); moveItemInArray(item.id, 'gallery', imgIdx, imgIdx + 1); }}
                                 className="p-0.5 bg-white/10 text-white rounded hover:bg-blue-600 transition-colors"
                               >
                                 <ChevronRight size={10} />
                               </button>
                             )}
                           </div>

                           {imgIdx > 0 && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const gallery = [...(item.gallery || [item.image_url])];
                                 [gallery[imgIdx], gallery[0]] = [gallery[0], gallery[imgIdx]];
                                 updateItem(item.id, 'gallery', gallery);
                                 updateItem(item.id, 'image_url', gallery[0]);
                               }}
                               className="p-1 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                               title="Set as Cover"
                             >
                               <Plus size={12} className="rotate-45" />
                             </button>
                           )}
                         </div>
                         {imgIdx === 0 && (
                           <div className="absolute bottom-0 left-0 right-0 bg-blue-600 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white">Cover</div>
                         )}
                       </div>
                     ))}
                     <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                       {uploadingStates[`${item.id}_gallery_achievements`] ? (
                         <div className="flex flex-col items-center">
                           <Upload size={14} className="text-blue-500 animate-bounce" />
                         </div>
                       ) : (
                         <>
                           <Plus size={16} className="text-slate-500" />
                           <span className="text-[7px] font-black uppercase text-slate-600 mt-1">Add</span>
                         </>
                       )}
                       <input
                         type="file"
                         className="hidden"
                         accept="image/*"
                         onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             setUploadingStates(prev => ({ ...prev, [`${item.id}_gallery_achievements`]: true }));
                             const url = await uploadAsset(file);
                             if (url) {
                               const currentGallery = item.gallery || (item.image_url ? [item.image_url] : []);
                               const newGallery = [...currentGallery, url];
                               updateItem(item.id, 'gallery', newGallery);
                               if (!item.image_url) updateItem(item.id, 'image_url', url);
                             }
                             setUploadingStates(prev => ({ ...prev, [`${item.id}_gallery_achievements`]: false }));
                           }
                         }}
                       />
                     </label>
                  </div>
                </div>

                {item.comments && item.comments.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <label className="block text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                       Comments ({item.comments.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {item.comments.map((c: any) => (
                        <div key={c.id} className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.text}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const newComments = item.comments.filter((com: any) => com.id !== c.id);
                              updateItem(item.id, 'comments', newComments);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'blogs' && editingItemId === item.id && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Title</label>
                     <input type="text" value={item.title || ''} onChange={e => updateItem(item.id, 'title', e.target.value)} placeholder="Blog Title" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div className="w-48">
                     <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 ml-1">Publish Date</label>
                     <input type="date" value={item.published_at ? item.published_at.split('T')[0] : ''} onChange={e => updateItem(item.id, 'published_at', new Date(e.target.value).toISOString())} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>
                <JoditEditor value={item.content || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'content', newContent)} />
                
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                  <label className="block text-sm font-bold text-blue-400 uppercase tracking-wide">Blog Images</label>
                  <MultiImageHandler 
                    id={item.id}
                    images={item.gallery || (item.image_url ? [item.image_url] : [])} 
                    onImagesChange={(newImages) => {
                      updateItem(item.id, 'gallery', newImages);
                      if (newImages.length > 0) {
                        updateItem(item.id, 'image_url', newImages[0]);
                      }
                    }} 
                  />
                </div>

                {item.comments && item.comments.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <label className="block text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                       Comments ({item.comments.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {item.comments.map((c: any) => (
                        <div key={c.id} className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.text}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const newComments = item.comments.filter((com: any) => com.id !== c.id);
                              updateItem(item.id, 'comments', newComments);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'experiences' && editingItemId === item.id && (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    value={item.role || ''} 
                    onChange={e => updateItem(item.id, 'role', e.target.value)} 
                    placeholder={item.type === 'education' ? "Degree / Certificate (e.g. B.Sc in CSE)" : "Role (e.g. Lead Developer)"} 
                    className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                  />
                  <input 
                    type="text" 
                    value={item.company_institution || ''} 
                    onChange={e => updateItem(item.id, 'company_institution', e.target.value)} 
                    placeholder={item.type === 'education' ? "Institution / School" : "Company / Organization"} 
                    className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                  />
                  {item.type === 'education' && (
                    <input 
                      type="text" 
                      value={item.subject || ''} 
                      onChange={e => updateItem(item.id, 'subject', e.target.value)} 
                      placeholder="Subject / Group (e.g. Science)" 
                      className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                    />
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex gap-2">
                    <div className="flex flex-col gap-1 w-32">
                      <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Type</label>
                      <select 
                        value={['professional', 'education', 'club'].includes(item.type) ? item.type : 'custom'} 
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            updateItem(item.id, 'type', '');
                          } else {
                            updateItem(item.id, 'type', e.target.value);
                          }
                        }} 
                        className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-10"
                      >
                        <option value="professional">Professional</option>
                        <option value="education">Education</option>
                        <option value="club">Club</option>
                        <option value="custom">Custom...</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Category Title</label>
                      <input 
                        type="text" 
                        value={item.type || ''} 
                        onChange={e => updateItem(item.id, 'type', e.target.value)} 
                        placeholder={['professional', 'education', 'club'].includes(item.type) ? item.type : 'Type...'} 
                        className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-10 w-full" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Start Date</label>
                      <div className="flex gap-1">
                        <select 
                          value={item.date_range?.split(' to ')[0]?.split(' ')[0] || '1'} 
                          onChange={e => {
                            const startParts = (item.date_range?.split(' to ')[0] || '1 Jan 2024').split(' ');
                            const day = e.target.value;
                            const month = startParts.length === 3 ? startParts[1] : (startParts[0] || 'Jan');
                            const year = startParts.length === 3 ? startParts[2] : (startParts[1] || '2024');
                            const end = item.date_range?.split(' to ')[1] || 'Present';
                            const newRange = `${day} ${month} ${year} to ${end}`;
                            updateItem(item.id, 'date_range', newRange);
                            
                            // Update internal start_date for sorting
                            const monthIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month);
                            const d = new Date(parseInt(year), monthIdx, parseInt(day));
                            updateItem(item.id, 'start_date', d.toISOString());
                          }}
                          className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 text-white text-[10px] w-12 text-center"
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                          value={item.date_range?.split(' to ')[0]?.split(' ')[1] || 'Jan'} 
                          onChange={e => {
                            const startParts = (item.date_range?.split(' to ')[0] || '1 Jan 2024').split(' ');
                            const day = startParts.length === 3 ? startParts[0] : '1';
                            const month = e.target.value;
                            const year = startParts.length === 3 ? startParts[2] : (startParts[1] || '2024');
                            const end = item.date_range?.split(' to ')[1] || 'Present';
                            const newRange = `${day} ${month} ${year} to ${end}`;
                            updateItem(item.id, 'date_range', newRange);

                            // Update internal start_date for sorting
                            const monthIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month);
                            const d = new Date(parseInt(year), monthIdx, parseInt(day));
                            updateItem(item.id, 'start_date', d.toISOString());
                          }}
                          className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 text-white text-[10px] flex-1 text-center"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input 
                          type="number" 
                          placeholder="Year"
                          value={item.date_range?.split(' to ')[0]?.split(' ')[2] || item.date_range?.split(' to ')[0]?.split(' ')[1] || ''}
                          onChange={e => {
                            const startParts = (item.date_range?.split(' to ')[0] || '1 Jan 2024').split(' ');
                            const day = startParts.length === 3 ? startParts[0] : '1';
                            const month = startParts.length === 3 ? startParts[1] : (startParts[0] || 'Jan');
                            const year = e.target.value;
                            const end = item.date_range?.split(' to ')[1] || 'Present';
                            const newRange = `${day} ${month} ${year} to ${end}`;
                            updateItem(item.id, 'date_range', newRange);

                            // Update internal start_date for sorting
                            const monthIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month);
                            const d = new Date(parseInt(year) || new Date().getFullYear(), monthIdx, parseInt(day));
                            updateItem(item.id, 'start_date', d.toISOString());
                          }}
                          className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px] w-16 text-center"
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] text-slate-500 font-black uppercase">End Date</label>
                        <label className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 cursor-pointer">
                          <input 
                              type="checkbox" 
                              checked={!!item.date_range?.endsWith('Present')} 
                              onChange={e => {
                                const start = item.date_range?.split(' to ')[0] || '1 Jan 2024';
                                updateItem(item.id, 'date_range', `${start} to ${e.target.checked ? 'Present' : '1 Jan ' + new Date().getFullYear()}`);
                              }} 
                              className="w-3 h-3 rounded outline-none accent-blue-500" 
                          />
                          <span>PRESENT</span>
                        </label>
                      </div>
                      
                      <div className="flex gap-1 h-10 items-center">
                        {!item.date_range?.endsWith('Present') ? (
                          <>
                            <select 
                              value={item.date_range?.split(' to ')[1]?.split(' ')[0] || '1'} 
                              onChange={e => {
                                const start = item.date_range?.split(' to ')[0] || '1 Jan 2024';
                                const endParts = (item.date_range?.split(' to ')[1] || '1 Jan 2024').split(' ');
                                const day = e.target.value;
                                const month = endParts.length === 3 ? endParts[1] : (endParts[0] || 'Jan');
                                const year = endParts.length === 3 ? endParts[2] : (endParts[1] || '2024');
                                updateItem(item.id, 'date_range', `${start} to ${day} ${month} ${year}`);
                              }}
                              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 text-white text-[10px] w-12 text-center"
                            >
                              {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select 
                              value={item.date_range?.split(' to ')[1]?.split(' ')[1] || 'Jan'} 
                              onChange={e => {
                                const start = item.date_range?.split(' to ')[0] || '1 Jan 2024';
                                const endParts = (item.date_range?.split(' to ')[1] || '1 Jan 2024').split(' ');
                                const day = endParts.length === 3 ? endParts[0] : '1';
                                const month = e.target.value;
                                const year = endParts.length === 3 ? endParts[2] : (endParts[1] || '2024');
                                updateItem(item.id, 'date_range', `${start} to ${day} ${month} ${year}`);
                              }}
                              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 text-white text-[10px] flex-1 text-center"
                            >
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input 
                              type="number" 
                              placeholder="Year"
                              value={item.date_range?.split(' to ')[1]?.split(' ')[2] || item.date_range?.split(' to ')[1]?.split(' ')[1] || ''}
                              onChange={e => {
                                const start = item.date_range?.split(' to ')[0] || '1 Jan 2024';
                                const endParts = (item.date_range?.split(' to ')[1] || '1 Jan 2024').split(' ');
                                const day = endParts.length === 3 ? endParts[0] : '1';
                                const month = endParts.length === 3 ? endParts[1] : (endParts[0] || 'Jan');
                                const year = e.target.value;
                                updateItem(item.id, 'date_range', `${start} to ${day} ${month} ${year}`);
                              }}
                              className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px] w-16 text-center"
                            />
                          </>
                        ) : (
                          <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg h-full flex items-center justify-center text-blue-400 text-[10px] font-black uppercase tracking-widest">Ongoing Role</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 w-14">
                    <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Logo</label>
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(item.id);
                      }}
                      onDragLeave={() => setIsDraggingLogo(null)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setIsDraggingLogo(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const uploadKey = `${item.id}_image_url`;
                          setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
                          try {
                            const url = await uploadAsset(file);
                            if (url) {
                              updateItem(item.id, 'image_url', url);
                              showNotification('Logo uploaded via Drop!');
                            }
                          } finally {
                            setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
                          }
                        }
                      }}
                      className={`group h-10 cursor-pointer rounded-lg border border-dashed transition-all flex items-center justify-center relative overflow-hidden
                        ${isDraggingLogo === item.id ? 'bg-blue-600/20 border-blue-600 ring-2 ring-blue-500/50' : 'bg-transparent border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}
                    >
                      {uploadingStates[`${item.id}_image_url`] ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-full h-full relative">
                          <label className="w-full h-full flex items-center justify-center cursor-pointer">
                            {item.image_url ? (
                              <img src={item.image_url} alt="Logo" className="w-full h-full object-contain rounded-lg p-1" title="Change Logo (or Drop Here)" />
                            ) : (
                              <Upload size={16} className={`text-blue-500 group-hover:scale-110 transition-transform ${isDraggingLogo === item.id ? 'scale-125' : ''}`} />
                            )}
                            <input type="file" accept="image/*" disabled={uploadingStates[`${item.id}_image_url`]} onChange={(e) => handleListUpload(e, item.id, 'image_url')} className="hidden" />
                          </label>
                          {item.image_url && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateItem(item.id, 'image_url', '');
                                showNotification('Logo removed');
                              }}
                              className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              title="Remove Logo"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <JoditEditor value={item.description || ''} config={editorConfig} onBlur={newContent => updateItem(item.id, 'description', newContent)} />
                <div className="mt-4">
                  <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Bullet Points (One per line)</label>
                  <textarea 
                    rows={4} 
                    value={Array.isArray(item.bullet_points) ? item.bullet_points.join('\n') : (item.bullet_points || '')} 
                    onChange={e => updateItem(item.id, 'bullet_points', e.target.value.split('\n'))}
                    placeholder="Designed 50+ logos&#10;Managed 10+ social accounts&#10;Increased traffic by 200%"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>
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
                      value={['US','GB','CA','AU','DE','FR','IN','BD','AE','SA'].includes(item.country_flag) ? item.country_flag : ''} 
                      onChange={e => updateItem(item.id, 'country_flag', e.target.value)} 
                      className="bg-slate-900/50 border border-white/10 rounded-lg px-2 text-white text-sm w-32"
                    >
                      <option value="">No Flag</option>
                      <option value="US">🇺🇸 USA</option>
                      <option value="GB">🇬🇧 UK</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="AU">🇦🇺 Australia</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="IN">🇮🇳 India</option>
                      <option value="BD">🇧🇩 Bangladesh</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                    </select>
                    <input 
                      type="text" 
                      value={item.country_flag || ''} 
                      onChange={e => updateItem(item.id, 'country_flag', e.target.value)} 
                      placeholder="Code (e.g. US) or URL" 
                      className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex-1" 
                    />
                  </div>
                  <label className="group flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                    {uploadingStates[`${item.id}_avatar_url`] ? <span className="text-sm text-blue-400 animate-pulse">Uploading...</span> : (
                      <>
                        {item.avatar_url ? <img src={item.avatar_url} alt="Avatar" className="w-6 h-6 rounded object-cover border border-blue-500/50" /> : <Upload size={16} className="text-blue-400" />}
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
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Sleek Modern Sidebar */}
      <aside className="w-72 bg-[#0a0f1d] border-r border-white/5 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.4)] relative z-20">
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-500">
               <User size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">Hasinur</h2>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">HQ Control</span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { id: 'dashboard', label: 'Overview', icon: <BarChart3 size={18} /> },
              { id: 'profile', label: 'Identity', icon: <User size={18} /> },
              { id: 'experiences', label: 'Experience', icon: <Briefcase size={18} /> },
              { id: 'portfolio', label: 'Showcase', icon: <FileImage size={18} /> },
              { id: 'achievements', label: 'Milestones', icon: <Award size={18} /> },
              { id: 'blogs', label: 'Blog', icon: <FileText size={18} /> },
              { id: 'reviews', label: 'Client Reviews', icon: <Users size={18} /> },
              { id: 'messages', label: 'Messages', icon: <Mail size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/admin/${item.id}`)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden ${
                  activeTab === item.id 
                    ? 'text-white bg-white/5 shadow-inner' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500" 
                  />
                )}
                <span className={`transition-colors duration-300 ${activeTab === item.id ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 space-y-3 border-t border-white/5">
            <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-white/5 group">
              <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Back to Homepage
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 font-black text-xs uppercase tracking-widest transition-all duration-300 border border-transparent hover:border-red-500/20 group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-grid-white/[0.02]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 py-4 px-10 flex justify-between items-center text-slate-100">
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{activeTab}</span>
               </div>
               <h1 className="text-xl font-black text-white tracking-tighter uppercase">
                 {activeTab === 'dashboard' ? 'Control Dashboard' : `Manage ${
                   {
                     profile: 'Identity',
                     experiences: 'Experience',
                     portfolio: 'Showcase',
                     achievements: 'Milestones',
                     blogs: 'Blog',
                     reviews: 'Client Reviews',
                     messages: 'Messages'
                   }[activeTab] || activeTab
                 }`}
               </h1>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-black text-white">{profileData.name}</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                       Auth Active
                    </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden ring-4 ring-blue-500/10">
                      <img src={profileData.avatar_url || `https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png`} className="w-full h-full object-cover" alt="Profile" />
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 group"
                    title="Sign Out"
                  >
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
            </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
      {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-white/5">Identity Settings</h2>
              {renderProfileForm()}
            </motion.div>
          )}
          {['experiences', 'portfolio', 'achievements', 'blogs', 'reviews'].includes(activeTab) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Content Management</h2>
                <div className="flex gap-4">
                    <button onClick={handleSaveList} disabled={isSavingList} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)]">
                        <Save size={14} /> Update All
                    </button>
                </div>
              </div>
              {renderListForm()}
            </motion.div>
          )}
          {activeTab === 'messages' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-white/5">Contact Stream</h2>
              {renderMessagesList()}
            </motion.div>
          )}
        </div>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${
              notification.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm font-bold uppercase tracking-wider">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
