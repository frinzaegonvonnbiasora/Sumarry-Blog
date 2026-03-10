import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  Wallet, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResendEmail = async () => {
    setResendStatus('sending');
    try {
      // We need to re-authenticate to send verification email
      const result = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      await signOut(auth);
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message);
      setResendStatus('error');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // Google accounts are usually verified, but if we want to be strict, we'd check result.user.emailVerified
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await signOut(auth);
          setNeedsVerification(true);
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await sendEmailVerification(result.user);
        await signOut(auth);
        setNeedsVerification(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center"
        >
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Verify your email</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            We've sent a verification link to <span className="text-slate-900 font-bold">{email}</span>. 
            Please check your inbox and verify your account before logging in.
          </p>
          <button 
            onClick={() => {
              setNeedsVerification(false);
              setIsLogin(true);
            }}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 mb-4"
          >
            Go to Login
            <ArrowRight className="w-5 h-5" />
          </button>

          <button 
            onClick={handleResendEmail}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              resendStatus === 'sent' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {resendStatus === 'sending' && <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />}
            {resendStatus === 'sent' && <CheckCircle2 className="w-4 h-4" />}
            {resendStatus === 'sent' ? 'Verification Email Sent!' : 'Resend Verification Email'}
          </button>

          <p className="mt-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
            Didn't get the email? Check your spam folder.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" />
          
          <div className="flex flex-col items-center mb-10 relative z-10">
            <div className="bg-primary p-4 rounded-3xl shadow-xl shadow-primary/20 mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">SummaryBlog</h1>
            <p className="text-slate-500 font-medium">Verify to access your workspace.</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Display Name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 relative z-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-4 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Google Authentication
            </button>
          </div>

          <p className="mt-10 text-center text-slate-500 font-medium relative z-10">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-primary font-black hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
