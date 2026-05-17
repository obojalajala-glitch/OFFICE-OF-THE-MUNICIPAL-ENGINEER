import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useFirebase } from '../../lib/FirebaseProvider';

interface SecuritySetupModalProps {
  isOpen: boolean;
  onComplete: (username: string, password: string) => void;
  onCancel: () => void;
}

export function SecuritySetupModal({ isOpen, onComplete, onCancel }: SecuritySetupModalProps) {
  const [step, setStep] = useState<'USERNAME' | 'PASSWORD'>('USERNAME');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  
  const { isUsernameTaken } = useFirebase();

  const handleUsernameNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 4) {
      setError('Username must be at least 4 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain alphanumeric characters and underscores.');
      return;
    }

    setChecking(true);
    try {
      const taken = await isUsernameTaken(username);
      if (taken) {
        setError('This username is already taken. Please choose another one.');
      } else {
        setStep('PASSWORD');
      }
    } catch (err) {
      setError('Error checking username availability.');
    } finally {
      setChecking(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onComplete(username, password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 border-t-8 border-brand-gold"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/5 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-brand-blue uppercase tracking-tight">Security Credentials</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Set up your secure access to the municipal portal.</p>
          </div>

          <div className="flex gap-2 mb-8">
            <div className="flex-grow h-1 rounded-full bg-slate-100 overflow-hidden">
              <motion.div 
                className="h-full bg-brand-gold"
                initial={{ width: '0%' }}
                animate={{ width: step === 'USERNAME' ? '50%' : '100%' }}
              />
            </div>
          </div>

          {step === 'USERNAME' ? (
            <form onSubmit={handleUsernameNext} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select a Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="text"
                    placeholder="e.g. juandelacruz"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-brand-blue outline-none transition-all uppercase tracking-widest"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Used for future logins to this portal.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onCancel}
                  className="flex-grow py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-lg uppercase transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={checking}
                  className="flex-[2] py-3 bg-brand-blue text-white text-xs font-black rounded-lg uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  {checking ? <Loader2 className="animate-spin" size={16} /> : <div className="flex items-center gap-2">Next Step <ArrowRight size={16} /></div>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Create a Secure Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="password"
                    placeholder="Minimal 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-brand-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm Your Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-brand-blue outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep('USERNAME')}
                  className="flex-grow py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-lg uppercase transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 bg-brand-gold text-brand-blue text-xs font-black rounded-lg uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20"
                >
                  <CheckCircle2 size={16} /> Complete Account
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
