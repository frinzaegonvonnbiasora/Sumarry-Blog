import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, ArrowRight, Github } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onEmailSignUp: (email: string, pass: string) => Promise<void>;
  verificationRequired: boolean;
  onBackToLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onGoogleLogin,
  onEmailLogin,
  onEmailSignUp,
  verificationRequired,
  onBackToLogin
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 'signin') {
        await onEmailLogin(email, password);
      } else {
        await onEmailSignUp(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-12 flex flex-col items-center">
              {verificationRequired ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Verify Email</h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Check your email & verify your account, then log in to access your vault.
                  </p>
                  <button 
                    onClick={onBackToLogin}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    Back to Login
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Icon */}
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-emerald-500" />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {activeTab === 'signin' ? 'Welcome Back' : 'Join Us'}
                  </h2>
                  <p className="text-slate-500 text-sm mb-8">
                    {activeTab === 'signin' 
                      ? 'Enter your credentials to access your vault.' 
                      : 'Create an account to start your journey.'}
                  </p>

                  {/* Tabs */}
                  <div className="flex w-full border-b border-slate-100 mb-8">
                    <button
                      onClick={() => setActiveTab('signin')}
                      className={`flex-1 pb-4 text-sm font-bold transition-all relative ${
                        activeTab === 'signin' ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      Sign In
                      {activeTab === 'signin' && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" 
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 pb-4 text-sm font-bold transition-all relative ${
                        activeTab === 'signup' ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      Sign Up
                      {activeTab === 'signup' && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" 
                        />
                      )}
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="w-full space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                          Password
                        </label>
                        <button type="button" className="text-xs font-bold text-emerald-500 hover:text-emerald-600">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="w-full flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Or continue with
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Social Logins */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm">
                      <Github className="w-5 h-5" />
                      GitHub
                    </button>
                    <button 
                      onClick={onGoogleLogin}
                      className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      Google
                    </button>
                  </div>
                </>
              )}

              {/* Footer */}
              <p className="mt-10 text-[10px] text-slate-400 text-center leading-relaxed max-w-[280px]">
                By continuing, you agree to Summary Blog's{' '}
                <button className="text-emerald-500 font-bold">Terms of Service</button> and{' '}
                <button className="text-emerald-500 font-bold">Privacy Policy</button>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
