import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Share2, 
  Clock,
  Search,
  File,
  Save,
  ChevronLeft
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { PrivateDoc } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MyFilesProps {
  userId: string;
  userName: string;
  userPhoto: string;
}

export const MyFiles: React.FC<MyFilesProps> = ({ userId, userName, userPhoto }) => {
  const [files, setFiles] = useState<PrivateDoc[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFile, setEditingFile] = useState<PrivateDoc | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, `users/${userId}/privateData`),
      where('type', '==', 'file')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrivateDoc[];
      setFiles(docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileTitle.trim()) return;

    try {
      await addDoc(collection(db, `users/${userId}/privateData`), {
        type: 'file',
        title: newFileTitle,
        content: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewFileTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding file:", error);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    try {
      await updateDoc(doc(db, `users/${userId}/privateData`, editingFile.id), {
        content: fileContent,
        updatedAt: serverTimestamp()
      });
      setEditingFile(null);
      setFileContent('');
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/privateData`, id));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handlePostToHomepage = async (file: PrivateDoc) => {
    try {
      await addDoc(collection(db, 'posts'), {
        title: file.title,
        content: `Shared File: ${file.content?.substring(0, 100) || ''}...`,
        authorId: userId,
        authorName: userName,
        authorPhoto: userPhoto,
        createdAt: serverTimestamp()
      });
      alert('Posted to homepage!');
    } catch (error) {
      console.error("Error posting to homepage:", error);
    }
  };

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (editingFile) {
    return (
      <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
        <button 
          onClick={() => setEditingFile(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Library
        </button>
        <div className="flex-1 bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 flex flex-col">
          <input 
            type="text" 
            className="text-4xl font-black text-slate-900 mb-8 w-full focus:outline-none"
            value={editingFile.title}
            readOnly
          />
          <textarea 
            className="flex-1 w-full p-8 bg-slate-50 rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg leading-relaxed text-slate-600 resize-none"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="Write your file content here..."
          />
          <button 
            onClick={handleSaveFile}
            className="mt-8 flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all self-end"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif mb-2">Media Library</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your images, documents, and blog assets.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          <Plus className="w-5 h-5" />
          Upload Asset
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search your library..." 
          className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-primary border-dashed shadow-xl"
            >
              <form onSubmit={handleAddFile}>
                <h3 className="text-lg font-black text-slate-900 mb-4">New File Title</h3>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all mb-4 font-bold"
                  placeholder="e.g. Q3 Report"
                  value={newFileTitle}
                  onChange={(e) => setNewFileTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    Create
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredFiles.map((file) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={file.id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative cursor-pointer"
            onClick={() => {
              setEditingFile(file);
              setFileContent(file.content || '');
            }}
          >
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 w-fit mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <File className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors truncate pr-12">
              {file.title}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Clock className="w-3 h-3" />
              <span>{file.createdAt?.toDate().toLocaleDateString() || 'Just now'}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFile(file);
                  setFileContent(file.content || '');
                }}
                className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostToHomepage(file);
                }}
                className="flex-1 py-3 bg-primary/5 text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Post
              </button>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(file.id);
              }}
              className="absolute top-8 right-8 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">No files found</h3>
          <p className="text-slate-500">Start by adding your first private file.</p>
        </div>
      )}
    </div>
  );
};
