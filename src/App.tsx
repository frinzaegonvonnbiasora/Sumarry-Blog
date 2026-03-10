import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Homepage } from './components/Homepage';
import { MyFiles } from './components/MyFiles';
import { MyNotes } from './components/MyNotes';
import { TeamMembers } from './components/TeamMembers';
import { Profile } from './components/Profile';
import { AssistantChat } from './components/AssistantChat';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './services/geminiService';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('activeView') || 'homepage';
  });
  const [role, setRole] = useState<UserRole>('USER');
  const [blogContext, setBlogContext] = useState('');

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        // Simple admin check
        if (currentUser.email === 'weakfrick1@gmail.com') {
          setRole('ADMIN');
        } else {
          setRole('USER');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch latest posts for AI context
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.title}: ${data.content}`;
      }).join('\n');
      setBlogContext(posts);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Loading SummaryBlog...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'homepage':
        return <Homepage user={user} />;
      case 'myfiles':
        return <MyFiles userId={user.uid} userName={user.displayName || 'User'} userPhoto={user.photoURL || ''} />;
      case 'mynotes':
        return <MyNotes userId={user.uid} userName={user.displayName || 'User'} userPhoto={user.photoURL || ''} user={user} />;
      case 'teammembers':
        return <TeamMembers />;
      case 'profile':
        return <Profile user={user} role={role} />;
      default:
        return <Homepage user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout} 
        user={user}
      />
      
      <main className="flex-1 lg:ml-72 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AssistantChat role={role} blogContent={blogContext} />
    </div>
  );
}
