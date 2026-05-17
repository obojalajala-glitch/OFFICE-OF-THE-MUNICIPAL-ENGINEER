import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface RecaptchaModalProps {
  isOpen: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

export function RecaptchaModal({ isOpen, onVerify, onCancel }: RecaptchaModalProps) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  
  const images = [
    "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1503387762-59293129e3a8?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1508333706533-1ec430188812?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1449156003053-c30d35f7505c?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1518005020480-1097c02bc692?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200"
  ];

  const handleToggle = (idx: number) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter(i => i !== idx));
    } else {
      setSelected([...selected, idx]);
    }
  };

  const handleVerify = () => {
    if (selected.length < 3) return;
    setLoading(true);
    setTimeout(() => {
      onVerify();
      setLoading(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded shadow-2xl overflow-hidden relative z-10"
      >
        <div className="bg-blue-600 p-6 text-white">
          <p className="text-xs font-bold leading-none mb-1">Select all squares with</p>
          <h2 className="text-2xl font-black uppercase leading-tight">Construction Sites</h2>
          <p className="text-[10px] font-bold opacity-80 mt-1">If there are none, click skip</p>
        </div>

        <div className="p-1 bg-slate-200 grid grid-cols-3 gap-1">
          {images.map((url, i) => (
            <div 
              key={i}
              onClick={() => handleToggle(i)}
              className="aspect-square relative cursor-pointer overflow-hidden border-2 border-transparent transition-all"
            >
              <img src={url} alt="Challenge" className="w-full h-full object-cover" />
              {selected.includes(i) && (
                <div className="absolute inset-0 bg-blue-500/40 border-4 border-blue-500 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 flex items-center justify-between border-t border-slate-100">
          <div className="flex gap-4 text-slate-400">
            <RefreshCw size={20} className="hover:text-slate-600 cursor-pointer" />
            <ShieldCheck size={20} className="hover:text-slate-600 cursor-pointer" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleVerify}
              disabled={loading || selected.length < 3}
              className="px-6 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
