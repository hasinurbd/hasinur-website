export const defaultMockProfile = {
  name: "S M Hasinur Rahman",
  title: "Content Writing",
  bio: "Creative Content Writing specialist dedicated to crafting compelling stories and building digital presence. I am currently a CSE Undergraduate at UIU with a passion for creative solutions.",
  email: "hasinurrahman.me@gmail.com",
  phone: "+8801518914773",
  location: "Dhaka, Bangladesh",
  avatar_url: "/hasinur_profile_pic_design_in_ps.png",
  resume_url: "#",
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

export const getMockProfile = () => getMockData('mockProfile', defaultMockProfile);
export const saveMockProfile = (data: any) => saveMockData('mockProfile', data);

export const mockExperiences = [
  {
    id: "1",
    company_institution: "United International University",
    role: "BSc in Computer Science and Engineering",
    status: "Current",
    type: "education",
    description: "Pursuing undergraduate studies with a focus on problem-solving and software development.",
    bullet_points: [
      "Core focus on CSE fundamentals",
      "Engaged in technical projects",
      "Active in extracurricular activities"
    ],
    date_range: "2023 - Present"
  },
  {
    id: "2",
    company_institution: "itel",
    role: "Official Group Moderator",
    status: "Current",
    type: "professional",
    description: "Managing community engagement and providing support for a large user base.",
    bullet_points: [
      "Community management",
      "User support and engagement",
      "Content moderation"
    ],
    date_range: "2022 - Present"
  },
  {
    id: "3",
    company_institution: "হযবরল English",
    role: "General Manager",
    status: "Current",
    type: "professional",
    description: "Overseeing management and operations.",
    bullet_points: [
      "Project management",
      "Operations coordination",
      "Team leadership"
    ],
    date_range: "2023 - Present"
  },
  {
    id: "4",
    company_institution: "Clienteno",
    role: "HR & Graphics Designer",
    status: "Former",
    type: "creative",
    description: "Dual role managing HR processes and creative design assets.",
    bullet_points: [
      "Visual design for branding",
      "Recruitment coordination",
      "Employee engagement"
    ],
    date_range: "2021 - 2022"
  },
  {
    id: "5",
    company_institution: "ACS",
    role: "Response Team Member & Designer",
    status: "Former",
    type: "professional",
    description: "Fast-paced role focusing on design and quick response operations.",
    bullet_points: [
      "Design for social media",
      "Operations support",
      "Brand monitoring"
    ],
    date_range: "2020 - 2021"
  }
];

export const mockPortfolioItems = [
  {
    id: '1',
    title: 'Brand Identity Design',
    category: 'graphics',
    image_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=600',
    link: 'https://dribbble.com'
  },
  {
    id: '2',
    title: 'E-commerce UI/UX Website',
    category: 'web',
    image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600',
    link: 'https://github.com'
  },
  {
    id: '3',
    title: 'Ad Campaign Creative',
    category: 'graphics',
    image_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600',
    link: '#'
  },
  {
    id: '4',
    title: 'Social Media Strategy',
    category: 'projects',
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600',
    link: 'https://linkedin.com'
  },
  {
    id: '5',
    title: 'Product Launch Video',
    category: 'video',
    image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=600',
    link: 'https://youtube.com'
  },
  {
    id: '6',
    title: 'Corporate Web Dashboard',
    category: 'web',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    link: 'https://behance.net'
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
    country_flag: '🇺🇸',
    rating: 5,
    service_taken: 'Content Strategy & Copywriting',
    text: 'Hasinur transformed our brand messaging completely. His ability to craft compelling narratives that resonate with our target audience is exceptional. Seen a 40% increase in engagement since we started working together.'
  },
  {
    id: '2',
    name: 'David Chen',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    country_flag: '🇨🇦',
    rating: 5,
    service_taken: 'Technical Writing',
    text: 'It is rare to find someone who understands complex technical concepts and can explain them so simply. The documentation provided was top-notch and exactly what our developers needed.'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    country_flag: '🇪🇸',
    rating: 5,
    service_taken: 'Social Media Management',
    text: 'Exceptional creativity and a keen eye for design. Hasinur not only provided great copy but also suggested visual directions that really made our campaigns pop.'
  }
];
