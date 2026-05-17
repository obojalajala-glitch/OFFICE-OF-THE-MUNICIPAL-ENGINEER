import React, { useState } from 'react';
import { User, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useFirebase } from '../../lib/FirebaseProvider';
import { motion } from 'motion/react';

export function LoginInterface() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials, isLoggingIn } = useFirebase();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      await loginWithCredentials(username, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid username or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled in Firebase Console.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-center gap-3">
      <form onSubmit={handleLogin} className="flex items-center gap-2">
        <div className="relative group">
          <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-brand-blue/50 border border-white/20 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-black text-white placeholder:text-blue-300/50 focus:outline-none focus:border-brand-gold w-32 tracking-widest uppercase transition-all"
          />
        </div>
        
        <div className="relative group">
          <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="password" 
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-brand-blue/50 border border-white/20 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-black text-white placeholder:text-blue-300/50 focus:outline-none focus:border-brand-gold w-32 tracking-widest uppercase transition-all"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoggingIn}
          className="bg-brand-gold hover:bg-yellow-400 text-brand-blue h-8 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        </button>
      </form>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20"
        >
          <AlertCircle size={12} /> {error}
        </motion.div>
      )}
    </div>
  );
}
