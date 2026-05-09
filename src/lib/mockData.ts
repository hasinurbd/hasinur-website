export const defaultMockProfile = {
  name: "S M Hasinur Rahman",
  title: "Creative Designer & Full Stack Developer",
  bio: "Creative Designer & Full Stack Developer specializing in graphic design, digital branding, and modern web development. Currently a CSE Undergraduate at UIU, merging technical expertise with artistic vision.",
  email: "hasinurrahman.me@gmail.com",
  phone: "+8801518914773",
  location: "Dhaka, Bangladesh",
  avatar_url: "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png",
  resume_url: "#",
  facebook_url: "https://facebook.com/hasinur01",
  instagram_url: "https://instagram.com/hasinur_rahman",
  linkedin_url: "https://linkedin.com/in/hasinurbd",
  github_url: "https://github.com/hasinurbd",
  behance_url: "https://behance.net/hasinurbd",
  twitter_url: "https://twitter.com/hasinurbd",
  youtube_url: "https://youtube.com/@hasinurbd",
};

export const getMockData = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  }
  return defaultValue;
};

export const saveMockData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const getMockProfile = () => getMockData('mock_profile', defaultMockProfile);
export const saveMockProfile = (data: any) => saveMockData('mock_profile', data);

export const mockExperiences = [
  {
    id: "1",
    company_institution: "Itel",
    role: "Group Moderator",
    status: "Current",
    type: "professional",
    description: "",
    bullet_points: [],
    date_range: ""
  },
  {
    id: "2",
    company_institution: "হযবরল English",
    role: "Manager",
    status: "Current",
    type: "professional",
    description: "",
    bullet_points: [],
    date_range: ""
  },
  {
    id: "3",
    company_institution: "ACS",
    role: "Response Team Member & Designer",
    status: "Former",
    type: "club",
    description: "",
    bullet_points: [],
    date_range: ""
  },
  {
    id: "4",
    company_institution: "Clienteno",
    role: "Hr & Graphics Designer",
    status: "Former",
    type: "club",
    description: "",
    bullet_points: [],
    date_range: ""
  }
];

export const mockPortfolioItems = [
  {
    id: '1',
    title: 'Poster Shorai',
    category: 'graphics',
    image_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=600',
    link: 'https://www.postershorai.com/'
  },
  {
    id: '2',
    title: 'PlastiXide',
    category: 'projects',
    image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600',
    link: 'https://www.plastixide.com/'
  }
];

export const mockAchievements = [
  {
    id: '1',
    title: "Official Moderator at itel",
    date: "2024-05-06T00:00:00.000Z",
    description: "<p>Recognition for <strong>outstanding community management</strong> and leadership at itel official group.</p>",
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    full_story_link: "#",
    author: "itel Official"
  },
  {
    id: '2',
    title: "Best Graphic Designer Award",
    date: "2023-11-12T00:00:00.000Z",
    description: "<ul><li>Received the Best Designer of the Year award at UIU Creative Club.</li><li>Recognized for <em>innovative</em> digital art.</li></ul>",
    image_url: "https://images.unsplash.com/photo-1507676184212-d03504fbdf08?auto=format&fit=crop&q=80&w=800",
    full_story_link: "https://www.google.com",
    author: "University Club"
  },
  {
    id: '3',
    title: "Content Writing Competition Winner",
    date: "2023-04-20T00:00:00.000Z",
    description: "Won 1st place in National Content Writing competition across 50+ universities for crafting persuasive and creative articles.",
    image_url: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=800",
    full_story_link: "https://www.medium.com",
    author: "National Writing Board"
  }
];

export const mockBlogs = [
  {
    id: '1',
    title: 'The Future of Social Media Marketing in 2026',
    content: '<p>Social media keeps evolving. In this post, we explore the major trends affecting designers, marketers, and brands...</p><ul><li>AI driven marketing</li><li>Video content</li><li>Community building</li></ul>',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    published_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Creating Engaging Visuals for Web',
    content: '<p>A guide to <span style="color: #60a5fa;">optimizing</span> and designing images that grab attention immediately. Discover why <strong>typography</strong> and <em>color contrast</em> are so important.</p>',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    published_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '3',
    title: 'Balancing Code and Creativity',
    content: '<p>How I manage studying Computer Science and Engineering while maintaining my creative passions in writing and graphic design. It is a challenging but rewarding journey.</p>',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    published_at: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];

export const mockReviews = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    country_flag: 'US',
    rating: 5,
    service_taken: 'Content Strategy & Copywriting',
    text: 'Hasinur transformed our brand messaging completely. His ability to craft compelling narratives that resonate with our target audience is exceptional. Seen a 40% increase in engagement since we started working together.'
  },
  {
    id: '2',
    name: 'David Chen',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    country_flag: 'CA',
    rating: 5,
    service_taken: 'Technical Writing',
    text: 'It is rare to find someone who understands complex technical concepts and can explain them so simply. The documentation provided was top-notch and exactly what our developers needed.'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    country_flag: 'ES',
    rating: 5,
    service_taken: 'Social Media Management',
    text: 'Exceptional creativity and a keen eye for design. Hasinur not only provided great copy but also suggested visual directions that really made our campaigns pop.'
  }
];
