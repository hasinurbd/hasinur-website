import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, Clock, ArrowLeft, Send, MessageSquare, ChevronLeft, ChevronRight, Heart, Share2, FileDown } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { getMockData, mockBlogs } from '../lib/mockData';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Interaction states
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
          if (data && !error) {
            setBlog(data);
            setLikes(data.likes || 0);
            setComments(data.comments || []);
          }
        } else {
          const localData = getMockData('mock_blogs', mockBlogs);
          const found = localData.find((b: any) => b.id === id);
          if (found) {
            setBlog(found);
            setLikes(found.likes || 0);
            setComments(found.comments || []);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    if (isLiked) return;
    const newLikes = likes + 1;
    setLikes(newLikes);
    setIsLiked(true);
    try {
      if (hasSupabaseConfig) {
        await supabase.from('blogs').update({ likes: newLikes }).eq('id', id);
      } else {
        const localData = getMockData('mock_blogs', mockBlogs);
        const updatedLocalData = localData.map((b: any) => b.id === id ? { ...b, likes: newLikes } : b);
        localStorage.setItem('mock_blogs', JSON.stringify(updatedLocalData));
      }
    } catch (err) { console.error(err); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, text: 'Check out this article', url: window.location.href });
      } catch (e) { console.log('Share aborted'); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const handleDownloadPDF = () => {
    if (window.self !== window.top) {
      const confirmOpen = window.confirm("Printing works best in a new tab. Would you like to open this blog in a new tab to download the PDF?");
      if (confirmOpen) {
        window.open(window.location.href, '_blank');
        return;
      }
    }
    window.print();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;

    setIsSubmitting(true);
    const newComment = {
      id: Date.now().toString(),
      name: commentName,
      text: commentText,
      created_at: new Date().toISOString()
    };

    const updatedComments = [newComment, ...comments];

    try {
      if (hasSupabaseConfig) {
        const { error } = await supabase
          .from('blogs')
          .update({ comments: updatedComments })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const localData = getMockData('mock_blogs', mockBlogs);
        const updatedLocalData = localData.map((b: any) => b.id === id ? { ...b, comments: updatedComments } : b);
        localStorage.setItem('mock_blogs', JSON.stringify(updatedLocalData));
      }
      
      setComments(updatedComments);
      setCommentText('');
      setCommentName('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-white mb-4">Blog post not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Go Back Home</button>
      </div>
    );
  }

  const gallery = blog.gallery || (blog.image_url ? [blog.image_url] : []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black uppercase tracking-widest text-xs">Back to Articles</span>
        </Link>

        {/* Hero Section */}
        <div className="mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <FileText size={12} />
            Tech & Design Article
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              {new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              5 min read
            </div>
          </div>
        </div>

        {/* Gallery / Cover Section */}
        <div className="mb-12 space-y-4">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={gallery[activeImageIndex]}
                alt={blog.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {gallery.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev - 1 + gallery.length) % gallery.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev + 1) % gallery.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex justify-center gap-2">
              {gallery.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === index ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <article 
          className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-medium"
        >
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Interaction Bar */}
        <div className="mt-12 flex items-center gap-2 py-4 border-y border-white/5 print:hidden">
          <button 
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all ${
              isLiked ? 'bg-red-500/10 text-red-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </motion.div>
            <span className="text-xs font-black uppercase tracking-widest">{likes} Love</span>
          </button>

          <div className="flex flex-col items-center gap-1 px-5 py-3 bg-slate-900 text-slate-400 rounded-2xl">
             <MessageSquare size={20} />
             <span className="text-xs font-black uppercase tracking-widest">{comments.length} Comments</span>
          </div>

          <div className="flex-grow"></div>

          <div className="flex gap-2">
             <button onClick={handleShare} className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all"><Share2 size={20} /></button>
             <button onClick={handleDownloadPDF} className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all"><FileDown size={20} /></button>
          </div>
        </div>

        {/* Profile Card Mini */}
        <div className="mt-16 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
           <img src="https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png" className="w-24 h-24 rounded-full border-4 border-blue-500/50" />
           <div className="text-center md:text-left">
              <h4 className="text-xl font-black tracking-tighter text-white">S M Hasinur Rahman</h4>
              <p className="text-slate-400 text-sm mt-1">CSE Undergraduate at UIU & Creative Designer. Merging engineering logic with creative vision to build unique digital experiences.</p>
           </div>
        </div>

        {/* Comments Section */}
        <div className="mt-20 pt-10 border-t border-white/5 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Comment Form */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2">Reader Dialogue</h3>
                  <p className="text-slate-500 text-sm font-medium">Join the tech conversation and share your insights.</p>
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-4 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MessageSquare size={80} className="text-indigo-500" />
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Screen Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hasinur" 
                        value={commentName}
                        onChange={e => setCommentName(e.target.value)}
                        required
                        className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Your Perspective</label>
                      <textarea 
                        placeholder="Write your feedback..." 
                        rows={4}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        required
                        className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Syncing...' : 'Publish Comment'}
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Comment List */}
            <div className="lg:col-span-7">
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-4xl font-black tracking-tighter text-indigo-500">{comments.length}</span>
                <h4 className="text-xl font-bold uppercase tracking-tight text-white">Reflections</h4>
              </div>

              {comments.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/10">
                   <div className="inline-flex p-4 bg-slate-800/50 rounded-full text-slate-500 mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No thoughts yet. Lead the way!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment, index) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900/40 p-1 rounded-[2.2rem] border border-white/5 group hover:border-indigo-500/20 transition-all"
                    >
                      <div className="bg-slate-950/30 p-8 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:-rotate-3 transition-transform">
                            {comment.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-black text-white text-lg leading-none mb-1">{comment.name}</h5>
                            <div className="flex items-center gap-2">
                               <Calendar size={10} className="text-indigo-500" />
                               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm font-medium">
                          {comment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
