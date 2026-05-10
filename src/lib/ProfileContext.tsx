import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from './supabaseClient';
import { getMockProfile } from './mockData';

interface Profile {
  id?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  bio: string;
  avatar_url: string;
  resume_url: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  behance_url: string;
  twitter_url: string;
  youtube_url: string;
  website_url: string;
  updated_at?: string;
}

interface ProfileContextType {
  profile: Profile;
  loading: boolean;
  avatarUrl: string;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(getMockProfile());
  const [loading, setLoading] = useState(true);

  const getAvatarUrl = (url?: string) => {
    if (url && url.length > 5 && !url.includes('dicebear')) return url;
    return "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png";
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (hasSupabaseConfig) {
        const { data, error } = await supabase.from('profile_info').select('*').limit(1).maybeSingle();
        if (data && !error) {
          setProfile(data);
          localStorage.setItem('profile_cache', JSON.stringify(data));
        }
      } else {
        const cached = localStorage.getItem('profile_cache');
        if (cached) setProfile(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile.name) {
      document.title = `${profile.name} | Portfolio - ${profile.title}`;
      
      // Update theme-color meta tag
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', '#020617'); // slate-950
    }
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      loading, 
      avatarUrl: getAvatarUrl(profile.avatar_url),
      refreshProfile: fetchProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
