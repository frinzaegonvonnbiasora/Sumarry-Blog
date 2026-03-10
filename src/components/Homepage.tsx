import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Clock, 
  MessageSquare, 
  Heart, 
  Share2,
  StickyNote,
  File,
  User as UserIcon,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Hash,
  RefreshCw
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { motion } from 'motion/react';
import { BlogPostCard } from './BlogPostCard';
import { PostReader } from './PostReader';

interface HomepageProps {
  user: any;
}

export const Homepage: React.FC<HomepageProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = () => {
    setIsRefreshing(true);
    const q = query(
      collection(db, 'posts'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(docs);
      setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    // onSnapshot is real-time, but we can re-trigger for visual feedback
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const tags = ["#Tech", "#AI", "#LifeUpdates", "#Coding", "#UIUX", "#Storytelling", "#Career"];

  if (selectedPost) {
    return (
      <PostReader 
        post={selectedPost} 
        user={user}
        onClose={() => setSelectedPost(null)} 
      />
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header & Tags */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight font-serif mb-2">Community Feed</h1>
                <p className="text-slate-500 text-xl font-medium">Stories, insights, and assets from the community.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className={`p-5 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                  title="Refresh Feed"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                <div className="p-5 bg-primary/10 rounded-3xl text-primary hidden md:block">
                  <Globe className="w-12 h-12" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <div className="p-3 bg-primary text-white rounded-2xl font-bold text-sm whitespace-nowrap cursor-pointer hover:bg-primary/90 transition-colors">
                All Stories
              </div>
              {tags.map((tag) => (
                <div key={tag} className="p-3 bg-white border border-slate-100 text-slate-500 rounded-2xl font-bold text-sm whitespace-nowrap cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 opacity-50" />
                  {tag.replace('#', '')}
                </div>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {posts.map((post) => (
                <BlogPostCard 
                  key={post.id} 
                  post={post} 
                  user={user}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          ) : (
            /* Empty State Update */
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 border-dashed border-2 mb-16">
              <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <BookOpen className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 font-serif text-center">Start your first story</h3>
              <p className="text-slate-500 text-center max-w-sm font-medium text-lg leading-relaxed mb-10">
                The world is waiting for your unique perspective. Share your thoughts and insights with the community.
              </p>
              <button className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-3">
                <StickyNote className="w-6 h-6" />
                Write Your First Post
              </button>
            </div>
          )}

          {/* Featured Post Placeholder - Now at the Bottom */}
          <div className="mb-16">
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 aspect-[21/9] flex items-center group cursor-pointer shadow-2xl shadow-primary/10 border-4 border-white">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-primary to-blue-600" />
              <div className="relative z-10 p-12 md:p-16 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Featured Post
                  </span>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    12 min read
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight font-serif group-hover:translate-x-2 transition-transform duration-500">
                  The Future of Content: How AI is Reshaping Storytelling
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Editor's Choice</p>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-0.5">March 10, 2026</p>
                  </div>
                </div>
              </div>
              <div className="absolute right-12 bottom-12 z-10 p-4 bg-white rounded-full text-slate-900 group-hover:scale-110 transition-transform duration-500">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trending/Suggested */}
        <aside className="w-full lg:w-96 space-y-12 shrink-0">
          {/* Trending Topics */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8 text-primary">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-xl font-black text-slate-900 font-serif">Trending Topics</h3>
            </div>
            <div className="space-y-6">
              {[
                { title: "The rise of Decentralized Web", views: "12.4k views", tag: "#Web3" },
                { title: "Generative AI in Modern UI", views: "8.9k views", tag: "#AI" },
                { title: "Sustainable Design Patterns", views: "5.2k views", tag: "#UX" },
                { title: "Remote Work Culture 2026", views: "4.1k views", tag: "#Life" }
              ].map((topic, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1.5 opacity-70">
                    <Hash className="w-3 h-3" />
                    {topic.tag.replace('#', '')}
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">
                    {topic.title}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.views}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Writers */}
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
            <div className="flex items-center gap-3 mb-8 text-primary">
              <Award className="w-6 h-6" />
              <h3 className="text-xl font-black text-white font-serif">Top Contributors</h3>
            </div>
            <div className="space-y-8">
              {[
                { name: "Sarah Jenkins", role: "Product Designer", avatar: null },
                { name: "Alex Rivera", role: "Frontend Architect", avatar: null },
                { name: "Michael Chen", role: "AI Researcher", avatar: null }
              ].map((writer, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <UserIcon className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{writer.name}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{writer.role}</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/20 rounded-xl hover:bg-white hover:text-slate-900 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 rounded-2xl bg-white/10 text-white/60 font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
              View Leaderboard
            </button>
          </div>

          {/* Promotion Card */}
          <div className="relative rounded-[2.5rem] bg-primary p-10 overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-4 leading-tight font-serif">SummaryBlog Plus</h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed mb-8">
                Unlock premium insights, advanced analytics, and unlimited draft storage.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white text-primary font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
