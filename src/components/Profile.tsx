import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Save, 
  Camera,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';

interface ProfileProps {
  user: any;
  role: string;
}

export const Profile: React.FC<ProfileProps> = ({ user, role }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setDisplayName(data.displayName || '');
          setPhotoURL(data.photoURL || '');
          setBio(data.bio || '');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL
        });
      }

      // Update Firestore Profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
        bio,
        updatedAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Profile</h1>
        <p className="text-slate-500 text-lg">Manage your public identity on Summary Blog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{displayName || 'Anonymous'}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="w-full pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Account Status</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>User Role</span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                  role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ShieldCheck className="w-3 h-3" /> {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Short Bio</label>
                <div className="relative">
                  <Info className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none"
                    placeholder="Tell the community about yourself..."
                  />
                </div>
              </div>
            </div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {message.text}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
              <Save className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
