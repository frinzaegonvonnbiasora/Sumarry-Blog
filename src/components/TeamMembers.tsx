import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Search,
  ExternalLink,
  User as UserIcon
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';

export const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setMembers(docs);
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter(m => 
    m.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-slate-500 text-sm">Connect with other members of the Summary Blog community.</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Users className="w-8 h-8" />
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search members..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map((member) => (
          <motion.div 
            layout
            key={member.uid}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl overflow-hidden mb-6 shadow-lg border-4 border-white">
                {member.photoURL ? (
                  <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{member.displayName || 'Anonymous User'}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                <Mail className="w-3 h-3" />
                <span>{member.email}</span>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                {member.bio || "No bio provided yet. This member is busy building amazing things!"}
              </p>

              <button className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                View Profile <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">No members found</h3>
          <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};
