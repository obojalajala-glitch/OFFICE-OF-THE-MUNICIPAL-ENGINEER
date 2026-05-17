import React from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Home, 
  Zap, 
  Droplets, 
  Construction, 
  MapPin, 
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function ChecklistTab() {
  const [activeCategory, setActiveCategory] = React.useState('BUILDING');

  const categories = [
    { id: 'BUILDING', label: 'Building Permit', icon: Building2 },
    { id: 'ELECTRICAL', label: 'Electrical Permit', icon: Zap },
    { id: 'PLUMBING', label: 'Plumbing Permit', icon: Droplets },
    { id: 'FENCING', label: 'Fencing Permit', icon: Construction },
    { id: 'OCCUPANCY', label: 'Occupancy Permit', icon: Home },
  ];

  const requirements = {
    BUILDING: [
      { title: 'Duly accomplished Building Permit Form', sub: '5 copies, signed and sealed by professionals' },
      { title: 'Certified True Copy of TCT', sub: 'From Registry of Deeds (issued within 6 months)' },
      { title: 'Tax Declaration of Land', sub: 'Certified copy from Assessor\'s Office' },
      { title: 'Current Real Property Tax Receipt', sub: 'Photocopy (Current Year)' },
      { title: 'Technical Documents', sub: '5 sets of Architecture, Structural, Sanitary, etc.' },
      { title: 'Clearance from Municipal Planning', sub: 'Locational Clearance / Zoning' },
      { title: 'Fire Safety Evaluation Clearance', sub: 'From BFP (Bureau of Fire Protection)' },
    ],
    ELECTRICAL: [
      { title: 'Electrical Permit Form', sub: 'Signed by PEE (Professional Electrical Engineer)' },
      { title: 'Electrical Plans & Specifications', sub: 'Detailed wiring diagrams and loads' },
      { title: 'Copy of approved Building Permit', sub: 'If applicable' },
    ],
    PLUMBING: [
      { title: 'Plumbing Permit Form', sub: 'Signed by Master Plumber' },
      { title: 'Plumbing Plans', sub: 'Isometric views and septic tank details' },
    ],
    FENCING: [
      { title: 'Fencing Permit Form', sub: 'Standard OBO form' },
      { title: 'Lot Plan / Relocation Survey', sub: 'Signed by Geodetic Engineer' },
    ],
    OCCUPANCY: [
      { title: 'Certificate of Completion', sub: 'Signed by Building Official/Owner' },
      { title: 'Logbook of daily construction activity', sub: 'Prepared and signed by Site Architect/Engineer' },
      { title: 'Certificate of Fire Safety Inspection', sub: 'Final clearance from BFP' },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-brand-blue mb-12">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck size={32} className="text-brand-blue" />
          <h2 className="text-2xl font-black text-brand-blue uppercase tracking-tight">CHECKLIST OF REQUIREMENTS</h2>
        </div>
        <p className="text-slate-500 font-bold text-sm tracking-tight italic">
          "Ensuring procedural integrity and legal compliance for all municipal construction activities."
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Permit Categories</h3>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                activeCategory === cat.id 
                  ? "bg-brand-blue text-white shadow-lg border-brand-blue translate-x-1" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-blue"
              )}
            >
              <div className="flex items-center gap-3">
                <cat.icon size={20} />
                <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
              </div>
              <ChevronRight size={16} className={cn("transition-transform", activeCategory === cat.id ? "rotate-90" : "")} />
            </button>
          ))}

          <div className="mt-8 p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
             <div className="flex items-center gap-2 mb-3">
               <Info size={16} className="text-brand-blue" />
               <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Important Notice</span>
             </div>
             <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">
                All signatures on plans and documents MUST be original. Photocopies of professional signatures and dry seals are NOT accepted.
             </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
               <h4 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em]">{activeCategory} PERMIT REQUIREMENTS</h4>
               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Official documentary criteria for processing</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                {requirements[activeCategory as keyof typeof requirements].map((req, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-black text-[10px] border border-blue-100 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{req.title}</h5>
                      <p className="text-[11px] font-bold text-slate-500 italic">{req.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Processing Time: 7-15 Working Days</div>
                 <button className="text-[9px] font-black bg-slate-900 text-white px-6 py-3 rounded-lg uppercase tracking-widest hover:bg-brand-blue transition-colors">
                    View FAQ on this permit
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
