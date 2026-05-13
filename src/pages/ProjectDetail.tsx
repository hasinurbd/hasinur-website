import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Calendar, Tag, ArrowLeft, Heart, Share2, FileDown, MessageSquare, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { getMockData, mockPortfolioItems } from '../lib/mockData';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
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
    const fetchProject = async () => {
      setLoading(true);
      try {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.from('portfolio_items').select('*').eq('id', id).single();
          if (data && !error) {
            setProject(data);
            setLikes(data.likes || 0);
            setComments(data.comments || []);
          }
        } else {
          const localData = getMockData('mock_portfolio', mockPortfolioItems);
          const found = localData.find((a: any) => a.id === id);
          if (found) {
            setProject(found);
            setLikes(found.likes || 0);
            setComments(found.comments || []);
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    if (isLiked) return;
    
    const newLikes = likes + 1;
    setLikes(newLikes);
    setIsLiked(true);

    try {
      if (hasSupabaseConfig) {
        await supabase.from('portfolio_items').update({ likes: newLikes }).eq('id', id);
      } else {
        const localData = getMockData('mock_portfolio', mockPortfolioItems);
        const updatedLocalData = localData.map((p: any) => p.id === id ? { ...p, likes: newLikes } : p);
        localStorage.setItem('mock_portfolio', JSON.stringify(updatedLocalData));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share aborted');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    // If in iframe, suggest opening in new tab for better print experience
    if (window.self !== window.top) {
      const confirmOpen = window.confirm("Printing works best in a new tab. Would you like to open this project in a new tab to download the PDF?");
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
          .from('portfolio_items')
          .update({ comments: updatedComments })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const localData = getMockData('mock_portfolio', mockPortfolioItems);
        const updatedLocalData = localData.map((p: any) => p.id === id ? { ...p, comments: updatedComments } : p);
        localStorage.setItem('mock_portfolio', JSON.stringify(updatedLocalData));
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

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-white mb-4">Project not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Go Back Home</button>
      </div>
    );
  }

  const gallery = project.gallery || (project.image_url ? [project.image_url] : []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="print:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black uppercase tracking-widest text-xs">Explore Projects</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Visuals - 7 Columns */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-slate-900 print:rounded-none print:border-none">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={gallery[activeImageIndex]}
                  alt={project.title}
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors print:hidden"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev + 1) % gallery.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors print:hidden"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar print:hidden">
                {gallery.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === index ? 'border-blue-500 scale-105' : 'border-white/5 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Print Only Title Section */}
            <div className="hidden print:block mt-8">
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <p className="text-slate-600 mb-4">{project.category}</p>
              <div className="border-t border-slate-200 pt-4 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: project.description }} />
            </div>
          </div>

          {/* Sidebar - 5 Columns */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8 print:hidden">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest">
                  <Tag size={12} />
                  {project.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                  {project.title}
                </h1>
                
                <div className="flex flex-wrap gap-3">
                  {project.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>

             <div 
               className="text-slate-300 leading-relaxed text-lg prose prose-invert max-w-none"
               dangerouslySetInnerHTML={{ __html: project.description }}
             />

             {/* Action Stats Bar */}
             <div className="flex items-center gap-2 py-4 border-y border-white/5">
                <button 
                  onClick={handleLike}
                  className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all ${
                    isLiked ? 'bg-red-500/10 text-red-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
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
                   <button 
                     onClick={handleShare}
                     className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all hover:scale-110 active:scale-95"
                     title="Share Project"
                   >
                     <Share2 size={20} />
                   </button>
                   <button 
                     onClick={handleDownloadPDF}
                     className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all hover:scale-110 active:scale-95"
                     title="Download as PDF"
                   >
                     <FileDown size={20} />
                   </button>
                </div>
             </div>

             {project.link && project.link !== "#" && (
               <a 
                 href={project.link}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/10 active:scale-[0.98]"
               >
                 View Live Project <ExternalLink size={18} />
               </a>
             )}
          </div>
        </div>

        {/* Interaction/Comments Section */}
        <div className="mt-20 pt-10 border-t border-white/5 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Comment Form - Left (or top on mobile) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2">Project Dialogue</h3>
                  <p className="text-slate-500 text-sm font-medium">Join the discussion and share your thoughts on this work.</p>
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-4 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MessageSquare size={80} className="text-blue-500" />
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Your Identity</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hasinur" 
                        value={commentName}
                        onChange={e => setCommentName(e.target.value)}
                        required
                        className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Your Thoughts</label>
                      <textarea 
                        placeholder="Write a constructive comment..." 
                        rows={4}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        required
                        className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Post Comment <Send size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Comment List - Right */}
            <div className="lg:col-span-7">
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-4xl font-black tracking-tighter text-blue-500">{comments.length}</span>
                <h4 className="text-xl font-bold uppercase tracking-tight text-white">Responses</h4>
              </div>

              {comments.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <div className="inline-flex p-4 bg-slate-800/50 rounded-full text-slate-500 mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Be the first to start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {comments.map((comment, index) => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-900/40 p-1 rounded-[2rem] border border-white/5 group hover:border-blue-500/20 transition-all"
                      >
                        <div className="bg-slate-950/40 p-6 rounded-[1.8rem] space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:rotate-6 transition-transform">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="font-black text-white text-lg leading-none mb-1">{comment.name}</h5>
                              <div className="flex items-center gap-2">
                                <Calendar size={10} className="text-blue-500" />
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                                  {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-400 text-sm leading-relaxed pl-1">
                            {comment.text}
                          </div>
                        </div>
                      </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
