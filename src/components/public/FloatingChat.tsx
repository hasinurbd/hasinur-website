import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getMockProfile, mockExperiences, mockPortfolioItems } from '../../lib/mockData';

const profile = getMockProfile();

// Hardcoded QA dataset (can be moved to admin panel later)
const faqs = [
  { q: "What do you do?", a: "I specialize in Graphic Design, Social Media Management, Content Writing, and Web Development." },
  { q: "What skills do you have?", a: "I have expertise in Photoshop, Illustrator, Premiere Pro, UI/UX Design, HTML/CSS, React, and team management." },
  { q: "How can I contact you?", a: `You can reach me via email at ${profile.email} or call me at ${profile.phone}.` },
  { q: "Where are you located?", a: `I am located in ${profile.location}.` },
  { q: "What is your current role?", a: `I am currently the ${profile.title}.` },
  { q: "What are your recent projects?", a: "Some of my recent work includes Brand Identity Design, UI/UX Website designs, and Social Media Strategy." },
  { q: "Can you provide a resume?", a: `Yes! You can download my resume using the 'Download CV' button on the homepage, or visit: ${profile.resume_url || '#'}` }
];

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Hi! I'm S M Hasinur Rahman's chatbot. Ask me about his skills, contact info, or projects." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate typing delay based on message length
      const delay = Math.min(2000, 400 + userMessage.length * 10);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const lowerInput = userMessage.toLowerCase();
      let bestMatch = "I'm sorry, I don't have an answer for that right now. Please use the contact form to reach S M Hasinur directly!";
      
      // Simple intent classification
      if (lowerInput.includes('skill') || lowerInput.includes('know') || lowerInput.includes('can you do') || lowerInput.includes('expert')) {
        bestMatch = faqs.find(f => f.q.includes('skills'))?.a || bestMatch;
      } else if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone') || lowerInput.includes('reach') || lowerInput.includes('hire')) {
        bestMatch = faqs.find(f => f.q.includes('contact'))?.a || bestMatch;
      } else if (lowerInput.includes('project') || lowerInput.includes('portfolio') || lowerInput.includes('work') || lowerInput.includes('built')) {
        bestMatch = faqs.find(f => f.q.includes('projects'))?.a || bestMatch;
      } else if (lowerInput.includes('resume') || lowerInput.includes('cv') || lowerInput.includes('pdf')) {
        bestMatch = faqs.find(f => f.q.includes('resume'))?.a || bestMatch;
      } else if (lowerInput.includes('location') || lowerInput.includes('where') || lowerInput.includes('live')) {
        bestMatch = faqs.find(f => f.q.includes('located'))?.a || bestMatch;
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput.includes('hey') || lowerInput.startsWith('hi')) {
        const greetings = ["Hello!", "Hi there!", "Hey! How can I help you today?"];
        bestMatch = greetings[Math.floor(Math.random() * greetings.length)] + " Ask me about Hasinur's work, skills, or how to contact him.";
      } else if (lowerInput.includes('what do you do') || lowerInput.includes('role') || lowerInput.includes('job') || lowerInput.includes('profession')) {
        bestMatch = faqs.find(f => f.q.includes('role') || f.q.includes('do you do'))?.a || bestMatch;
      } else if (lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
        bestMatch = "You're very welcome! Feel free to ask anything else.";
      }

      setMessages(prev => [...prev, { role: 'model', content: bestMatch }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble processing that." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all z-50 hover:scale-110",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare size={24} />
      </button>

      <div 
        className={cn(
          "fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 transition-all origin-bottom-right duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Hasinur AI bot</h3>
              <p className="text-xs text-blue-400">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex max-w-[85%]", msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start")}>
              <div 
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-md",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-slate-800 border border-white/5 text-slate-200 rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex max-w-[85%] mr-auto justify-start">
              <div className="p-3 rounded-2xl bg-slate-800 border border-white/5 text-slate-400 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-900 rounded-b-2xl flex gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about my skills or experience..."
            className="flex-1 bg-slate-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </>
  );
}
