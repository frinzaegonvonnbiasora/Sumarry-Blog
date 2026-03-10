import React from 'react';
import { 
  Globe, 
  Image, 
  FileEdit, 
  Users, 
  LogOut,
  Wallet,
  Menu,
  X,
  User as UserIcon,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, user }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'homepage', label: 'Community Feed', icon: Globe },
    { id: 'myfiles', label: 'Media Library', icon: Image },
    { id: 'mynotes', label: 'Drafts & Posts', icon: FileEdit },
    { id: 'teammembers', label: 'Suggested Writers', icon: Users },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/30"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 text-primary mb-10">
            <Wallet className="w-10 h-10" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-serif">SummaryBlog</h1>
          </div>

          <button 
            className="w-full mb-8 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            onClick={() => {
              setActiveView('mynotes');
              setIsOpen(false);
            }}
          >
            <Plus className="w-5 h-5" />
            Write Post
          </button>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all
                    ${activeView === item.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user.displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
