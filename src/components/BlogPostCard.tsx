import React from 'react';
import { Clock, Heart, MessageSquare, Share2, User as UserIcon } from 'lucide-react';
import { Post } from '../types';
import { motion } from 'motion/react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

interface BlogPostCardProps {
  post: Post;
  user: any;
  onClick: () => void;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, user, onClick }) => {
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likesArray.includes(user?.uid) || false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the post
    if (!user) return;

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col h-full cursor-pointer active:scale-[0.98]"
    >
      {/* Cover Image Placeholder */}
      <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${post.id.length % 2 === 0 ? 'from-primary to-blue-500' : 'from-purple-500 to-pink-500'}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-slate-300 font-black text-4xl opacity-50 uppercase tracking-tighter select-none">SummaryBlog</span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white">
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">{post.authorName}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
              <span>{post.createdAt?.toDate().toLocaleDateString() || 'Just now'}</span>
              <span>•</span>
              <span className="text-primary">{post.readTime || 1} min read</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-primary transition-colors font-serif">
          {post.title}
        </h2>
        
        <p className="text-slate-500 leading-relaxed mb-8 line-clamp-3 flex-1">
          {post.content}
        </p>

        <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 font-bold text-xs transition-colors ${isLiked ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary' : ''}`} />
            <span>{likesArray.length}</span>
          </button>
          <button className="flex items-center gap-2 text-slate-400 font-bold text-xs hover:text-primary transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount || 0}</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); /* Handle share */ }}
            className="ml-auto text-slate-400 hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
