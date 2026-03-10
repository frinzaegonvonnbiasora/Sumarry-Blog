import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  increment,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Comment } from '../types';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  user: any;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, user }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(docs);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Add comment to subcollection
      await addDoc(collection(db, `posts/${postId}/comments`), {
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || '',
        createdAt: serverTimestamp()
      });

      // Update post's comment count
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-10">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-black text-slate-900 font-serif">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="flex gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 shrink-0 shadow-sm border border-slate-100">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <UserIcon className="w-6 h-6" />
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-5 bg-slate-50 rounded-[2rem] border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all text-lg leading-relaxed text-slate-600 resize-none min-h-[120px] font-medium"
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Comment List */}
      <div className="space-y-10">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 shrink-0 shadow-sm border border-slate-100">
              {comment.authorPhoto ? (
                <img src={comment.authorPhoto} alt={comment.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-black text-slate-900">{comment.authorName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {comment.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed border-2">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};
