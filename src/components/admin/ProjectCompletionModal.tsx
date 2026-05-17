import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Calendar,
  Loader2
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completionData: {
    completionPhotoUrl: string;
    completionNotes: string;
    completionDate: number;
    actualTotalCost: number;
  }) => void;
  projectName: string;
  originalBudget: number;
}

export function ProjectCompletionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName,
  originalBudget 
}: ProjectCompletionModalProps) {
  const [formData, setFormData] = useState({
    completionPhotoUrl: '',
    completionNotes: '',
    completionDate: new Date().toISOString().split('T')[0],
    actualTotalCost: originalBudget
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirm({
      ...formData,
      completionDate: new Date(formData.completionDate).getTime(),
      actualTotalCost: Number(formData.actualTotalCost)
    });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative z-10 border-t-8 border-emerald-500"
      >
        <div className="p-6 sm:p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                <CheckCircle2 size={12} /> Final Project Documentation
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Project Completion Log</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Recording final details for <span className="text-emerald-600 font-bold">{projectName}</span></p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completion Photo URL</label>
                <div className="relative">
                  <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.completionPhotoUrl}
                    onChange={(e) => setFormData({...formData, completionPhotoUrl: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actual Completion Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final Total Cost (PHP)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    type="number"
                    value={formData.actualTotalCost}
                    onChange={(e) => setFormData({...formData, actualTotalCost: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Initial Budget: ₱{originalBudget.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final Project Remarks & Success Notes</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-slate-300" />
                <textarea 
                  required
                  rows={4}
                  placeholder="Summarize the project outcome, any deviations from plan, and final assessment..."
                  value={formData.completionNotes}
                  onChange={(e) => setFormData({...formData, completionNotes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 pl-10 text-sm font-bold focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {formData.completionPhotoUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 relative group">
                <img 
                  src={formData.completionPhotoUrl} 
                  alt="Completion preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={32} className="text-white" />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-grow py-4 bg-slate-100 text-slate-600 text-xs font-black rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-emerald-600 text-white text-xs font-black rounded-xl uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Confirm Project Completion
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
