import React from 'react';
import { 
  Building2, 
  Map as MapIcon, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  Calendar,
  Construction,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

const Hero = ({ onAction }: { onAction: (id: string) => void }) => {
  return (
    <div className="relative overflow-hidden bg-brand-blue pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-gold font-bold text-xs uppercase tracking-widest mb-6 border border-brand-gold/30 backdrop-blur-sm">
              <ShieldAlert size={14} /> Official Citizen portal
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
              Modernizing <span className="text-brand-gold underline decoration-4 underline-offset-8">Infrastructure</span> <br />
              for a Resilient Jalajala
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed font-medium">
              Unified digital gateway for engineering permits, transparency in municipal projects, 
              and community safety reporting.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onAction('permits')}
                className="px-8 py-4 bg-brand-gold hover:bg-yellow-400 text-brand-blue font-black rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
              >
                APPLY FOR PERMIT <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onAction('mapping')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                VIEW PROJECTS MAP
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-black text-white mb-1">5+</div>
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Permit Categories</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">100%</div>
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Transaprency Rate</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">24/7</div>
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Digital Access</div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats/Features Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-brand-gold">
              <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                <h3 className="text-brand-blue font-black uppercase text-sm tracking-wide flex items-center gap-2">
                  <Construction className="text-brand-blue" size={18} />
                  Office Updates
                </h3>
                <span className="bg-blue-100 text-brand-blue text-[10px] px-2 py-1 rounded-full font-bold">LATEST</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 mb-1">Online Permitting Enabled</div>
                    <p className="text-xs text-slate-500">Processing times reduced by 40% via digital submission.</p>
                  </div>
                </div>
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 mb-1">Site Inspection Schedule</div>
                    <p className="text-xs text-slate-500">Weekly inspections updated: Tue/Thu 9:00 AM - 4:00 PM.</p>
                  </div>
                </div>
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 mb-1">Building Code Repository</div>
                    <p className="text-xs text-slate-500">Access PD 1096 and local engineering ordinances online.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-brand-blue text-center">
                 <span className="text-[10px] text-brand-gold font-bold tracking-[0.2em] uppercase">Status: Official Government Portal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
