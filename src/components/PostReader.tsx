import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  User as UserIcon
} from 'lucide-react';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Post } from '../types';
import { CommentSection } from './CommentSection';

interface PostReaderProps {
  post: Post;
  user: any;
  onClose: () => void;
}

export const PostReader: React.FC<PostReaderProps> = ({ post, user, onClose }) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const likesArray = Array.isArray(currentPost.likes) ? currentPost.likes : [];
  const isLiked = likesArray.includes(user?.uid) || false;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "posts", post.id), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentPost({ id: snapshot.id, ...snapshot.data() } as Post);
      }
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleLike = async () => {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col min-h-screen bg-white"
    >
      {/* Reader Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Feed
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16 w-full">
        {/* Author & Meta */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-50">
            {currentPost.authorPhoto ? (
              <img src={currentPost.authorPhoto} alt={currentPost.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{currentPost.authorName}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mt-1">
              <span>{currentPost.createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'Just now'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {currentPost.readTime || 1} min read
              </span>
            </div>
          </div>
          <button className="ml-auto px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">
            Follow
          </button>
        </div>

        {/* Post Title */}
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-10 leading-[1.1] font-serif tracking-tight">
          {currentPost.title}
        </h1>

        {/* Cover Image Placeholder */}
        <div className="aspect-[21/9] w-full bg-slate-100 rounded-[2.5rem] mb-16 overflow-hidden relative border border-slate-100 shadow-sm">
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${currentPost.id.length % 2 === 0 ? 'from-primary to-blue-500' : 'from-purple-500 to-pink-500'}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-200 font-black text-6xl uppercase tracking-tighter opacity-50 select-none">SummaryBlog</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-slate prose-xl max-w-none mb-20">
          <div className="text-slate-700 leading-[1.8] font-serif text-2xl whitespace-pre-wrap">
            {currentPost.content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2.5 transition-all group ${isLiked ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
            >
              <div className={`p-3 rounded-2xl transition-colors ${isLiked ? 'bg-primary/10' : 'bg-slate-50 group-hover:bg-primary/10'}`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-primary' : ''}`} />
              </div>
              <span className="font-bold text-lg">{likesArray.length}</span>
            </button>
            <div className="flex items-center gap-2.5 text-slate-500 group">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">{currentPost.commentCount || 0}</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors">
            <Share2 className="w-5 h-5" />
            Share story
          </button>
        </div>

        {/* Comment Section */}
        <CommentSection postId={currentPost.id} user={user} />
      </article>

      {/* Author Bottom Bio */}
      <div className="bg-slate-50 py-20 mt-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-xl mb-6 border-4 border-white">
              {currentPost.authorPhoto ? (
                <img src={currentPost.authorPhoto} alt={currentPost.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-white">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Written By</h4>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{currentPost.authorName}</h3>
            <p className="text-slate-500 max-w-md leading-relaxed mb-8">
              A passionate storyteller and content creator sharing insights on technology, design, and the future of the digital landscape.
            </p>
            <button className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
