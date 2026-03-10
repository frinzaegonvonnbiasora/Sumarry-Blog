import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock,
  Search,
  FileEdit,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PostEditor } from './PostEditor';
import { PostReader } from './PostReader';

interface MyNotesProps {
  userId: string;
  userName: string;
  userPhoto: string;
  user: any;
}

export const MyNotes: React.FC<MyNotesProps> = ({ userId, userName, userPhoto, user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [readingPost, setReadingPost] = useState<Post | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(docs);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (readingPost) {
    return (
      <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
        <PostReader 
          post={readingPost} 
          user={user}
          onClose={() => setReadingPost(null)} 
        />
      </div>
    );
  }

  if (editingPost || isAdding) {
    return (
      <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
        <PostEditor 
          userId={userId}
          userName={userName}
          userPhoto={userPhoto}
          post={editingPost}
          onClose={() => {
            setEditingPost(null);
            setIsAdding(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif mb-2">Drafts & Posts</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your stories and publications.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Story
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search your stories..." 
          className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={post.id}
            onClick={() => setEditingPost(post)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative cursor-pointer flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl ${post.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'} group-hover:scale-110 transition-transform`}>
                <FileEdit className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  post.status === 'published' 
                    ? 'bg-primary/5 text-primary border-primary/20' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 font-serif min-h-[3.5rem]">
              {post.title}
            </h3>
            
            <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed flex-1">
              {post.content}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setReadingPost(post);
                  }}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  title="View Story"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post.id);
                  }}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Story"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 border-dashed border-2">
          <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8">
            <BookOpen className="w-16 h-16 text-primary" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 font-serif text-center">No stories found</h3>
          <p className="text-slate-500 text-center max-w-sm font-medium text-lg leading-relaxed mb-10">
            You haven't created any stories yet. Start your journey as a writer today.
          </p>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Write Your First Story
          </button>
        </div>
      )}
    </div>
  );
};
