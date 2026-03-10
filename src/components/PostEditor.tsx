import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore"; 
import { db } from "../firebase";
import { 
  Save, 
  Share2, 
  ChevronLeft, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';

interface PostEditorProps {
  userId: string;
  userName: string;
  userPhoto: string;
  post?: Post | null;
  onClose: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({ 
  userId, 
  userName, 
  userPhoto, 
  post, 
  onClose 
}) => {
  const [title, setTitle] = useState(() => {
    if (post) return post.title;
    return localStorage.getItem(`draft_title_${userId}`) || '';
  });
  const [content, setContent] = useState(() => {
    if (post) return post.content;
    return localStorage.getItem(`draft_content_${userId}`) || '';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save current work to localStorage for auto-recovery on refresh
  useEffect(() => {
    if (!post) {
      localStorage.setItem(`draft_title_${userId}`, title);
      localStorage.setItem(`draft_content_${userId}`, content);
    }
  }, [title, content, userId, post]);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title.trim() || content.trim()) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, content]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const readTime = Math.ceil(content.split(/\s+/).length / 200) || 1;
      const postData = {
        title: title.trim(),
        content: content.trim(),
        authorId: userId,
        authorName: userName,
        authorPhoto: userPhoto,
        status: status,
        readTime: readTime,
        updatedAt: serverTimestamp(),
      };

      if (post?.id) {
        // Update existing post
        await updateDoc(doc(db, "posts", post.id), postData);
      } else {
        // Create new post
        await addDoc(collection(db, "posts"), {
          ...postData,
          likes: [],
          commentCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      // Clear draft storage after successful save
      if (!post) {
        localStorage.removeItem(`draft_title_${userId}`);
        localStorage.removeItem(`draft_content_${userId}`);
      }

      setLastSaved(new Date());
      if (status === 'published') {
        alert(post?.id ? "Post updated and published!" : "Your story is now live!");
        onClose();
      } else {
        setTimeout(() => setLastSaved(null), 3000);
      }
    } catch (err: any) {
      console.error("Error saving post:", err);
      setError(err.message || "Failed to save. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !title.trim() || !content.trim();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {lastSaved && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1"
              >
                <Save className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
              </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => handleSave('draft')}
            disabled={loading || isInvalid}
            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          
          <button 
            onClick={() => handleSave('published')}
            disabled={loading || isInvalid}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" />
            Publish Post
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Main Editor Interface */}
      <div className="flex-1 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
            {post?.id ? (post.status === 'published' ? 'Editing Live Post' : 'Editing Draft') : 'New Story'}
          </span>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {Math.ceil(content.split(/\s+/).length / 200) || 1} min read
          </span>
        </div>

        <input 
          type="text" 
          className="text-5xl font-black text-slate-900 mb-8 w-full focus:outline-none font-serif placeholder:text-slate-200 bg-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title..."
          disabled={loading}
        />
        
        <textarea 
          autoFocus
          className="flex-1 w-full p-8 bg-slate-50/50 rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-xl leading-relaxed text-slate-600 resize-none font-serif placeholder:text-slate-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell your story..."
          disabled={loading}
        />
      </div>
    </motion.div>
  );
};
